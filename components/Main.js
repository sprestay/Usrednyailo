import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, RefreshControl, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';


export const Main = (props) => {

    const calculate_avg = () => {
        let _price = Number(price);
        let _current = Number(current);

        if (_price && amount && avg_amount && _current) {
            let a = (_price * amount + avg_amount * _current) / (avg_amount + amount)
            return a.toFixed(2).toString();
        } else if (_price) {
            return price;
        } else return '';
    }

    const [price, setPrice] = useState(''); //Данные хранятся строкой, чтобы легче было учитывать десятичные дроби
    const [amount, setAmount] = useState(0);
    const [avg_amount, setAvgAmount] = useState(0);
    const [current, setCurrent] = useState('');
    const [avg, setAvg] = useState(calculate_avg());

    const [edit_avg, setEditAvg] = useState(false);
    const [tmp_avg, setTmpAvg] = useState('');
    
    const [refresh, setRefresh] = useState(false); // Для обновления компонента

    // Данная конструкция - аналоги componentWillUpdate. Мы не можем вызывать функцию 
    // calculate_avg в функции set_number, так как тогда при вычислении будут использоваться еще не измененные переменные
    const isFirstRender = React.useRef(true);
    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setAvg(calculate_avg());
    });

    const set_number = (val, t) => {
        if (val == '') { // Это чтобы пользователь мог стирать введенные данные полностью
            if (t == 'avg_amount') 
                setAvgAmount(0);
            else if (t == 'price')
                setPrice('');
            else if (t == 'amount')
                setAmount(0);
            else if (t == 'current')
                setCurrent('');

            return;
        }

        if (!isNaN(val) && Number(val) > 0) {
            if (t == 'avg_amount')
                setAvgAmount(parseInt(val, 10));
            else if (t == 'price')
                setPrice(val);
            else if (t == 'amount')
                setAmount(parseInt(val, 10));
            else if (t == 'current')
                setCurrent(val);
        }
    }

// Изменяя среднюю цену - изменяем необходимое количество акций
    const set_avg = (val) => {
        let _price = Number(price)
        let _current = Number(current)

        if (!isNaN(val) && _price > 0 && amount > 0 && _current > 0) {
            let _val = parseFloat(val, 10);
            if (_val > Math.min(_price, _current) && _val <= Math.max(_price, _current)) {
                let value = (_price * amount - _val * amount) / (_current - _val);
                setAvgAmount(-1 * Math.round(value));
            }
            setTmpAvg(val);
        }
    }

//Рефрешер
    const handleRefresh = () => {
        setRefresh(true);
        setPrice('');
        setAmount(0);
        setCurrent('');
        setAvgAmount(0);
        setAvg(calculate_avg());
        setEditAvg(false);
        setRefresh(false);
    }

    const total = () => {
        let _price = Number(price);
        let _current = Number(current);
        if (_price && amount && avg_amount && _current) {
            return (_price * amount + avg_amount * _current).toFixed(2).toString();
        } else {
            if (_price && amount)
                return (_price * amount).toFixed(2).toString();
            else return '-/-';
        }
    }

    return (
    <ScrollView
        refreshControl={<RefreshControl refreshing={refresh}
                                        onRefresh={handleRefresh} />}>
        <View style={styles.main_component}>

            <View>
                <Text style={styles.total_text_header}>Total position in share:</Text>
                <Text style={styles.total_text}>{total()}</Text>
            </View>

            <View style={styles.previous_data}>
                <TextInput
                    style={styles.price}
                    placeholder='price'
                    value={price}
                    onChangeText={(val) => set_number(val, 'price')}
                    keyboardType={'phone-pad'}
                />

                <TextInput
                    style={styles.amount}
                    placeholder='amount'
                    value={amount > 0 ? amount.toString() : ''}
                    onChangeText={(val) => set_number(val, 'amount')}
                    keyboardType={'phone-pad'}
                />

            </View>

            <View>
                <TextInput
                style={styles.avg}
                value={edit_avg ? tmp_avg : (avg == '' ? '-/-' : avg)}
                onChangeText={(val) => set_avg(val)}
                onFocus={() => setEditAvg(true)}
                onBlur={() => {
                    setEditAvg(false);
                    setTmpAvg('');
                }} //EditMode - при нажатие на поле "среднего" переходим к редактированию значения tmp_avg, которое, если будет валидно,
                //затем заменит avg
                editable={amount && Number(price) && Number(current) ? true : false}
                keyboardType={'phone-pad'}
                />
            </View>
 
        </View>
{/* Начинается блок для новой сделки */}
        <View style={styles.avg_block}>

                <Text style={styles.it_will_cost}>
                    It will cost you: {avg_amount && Number(current) ? (avg_amount * Number(current)).toFixed(2).toString() : '-/-'}
                </Text>

                <View style={styles.current}>

                    <TextInput
                        value={current}
                        style={styles.price}
                        onChangeText={(val) => set_number(val, 'current')}
                        keyboardType={'phone-pad'}
                        placeholder={'price'}
                    />

                    <TextInput
                        value={avg_amount > 0 ? avg_amount.toString() : ''}
                        style={styles.amount}
                        onChangeText={(val) => set_number(val, 'avg_amount')}
                        keyboardType={'phone-pad'}
                        placeholder={'amount'}
                    />
                </View>

                <Text style={styles.question}>
                    How many shares will you buy?
                </Text>
                    
                <Slider
                style={styles.slider_style}
                minimumValue={0}
                maximumValue={Number(current) < 10 ? 100 : 50}
                minimumTrackTintColor={'darkblue'}
                maximumTrackTintColor={'green'}
                thumbTintColor={'darkblue'}
                step={Number(current) < 10 ? 2 :1}
                value={avg_amount}
                onValueChange={(val) => set_number(val, 'avg_amount')}
                />
            </View>
</ScrollView>
    )
}

const styles = StyleSheet.create({
    main_component: {
        paddingTop: 80,
        paddingHorizontal: 20,
        height: 450,
    },

    previous_data: {
        flexDirection: 'row',
        display: 'flex',
        marginTop: 100,
        backgroundColor: '#00CC00',
        justifyContent: 'space-between',
        height: 60,
        borderRadius: 30,
    },

    price: {
        marginLeft: 2.5,
        backgroundColor: 'white',
        width: '47%',
        height: 55,
        borderBottomLeftRadius: 30,
        borderTopLeftRadius: 30,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 20,
        color: 'darkblue',
        fontStyle: 'italic',
    },

    amount: {
        marginRight: 2.5,
        backgroundColor: 'white',
        width: '47%',
        height: 55,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 20,
        color: 'darkblue',
        fontStyle: 'italic',
    },

    avg: {
        marginTop: 60,
        alignSelf: 'center',
        fontSize: 35,
        color: 'darkblue',
    },

    avg_block: {
        paddingHorizontal: 20,
    },

    slider_style: {
        width: "100%",
        height: 40,
    },

    avg_input: {
        textAlign: 'center',
        marginHorizontal: 30,
        height: 50,
        fontSize: 25,
        color: 'darkblue',
        borderRadius: 30,
        borderColor: 'darkblue',
        borderWidth: 2,
        marginBottom: 30,
    },

    question: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15,
        marginTop: 60,
        color: 'darkblue'
    },

    current: {
        flexDirection: 'row',
        display: 'flex',
        backgroundColor: 'darkblue',
        justifyContent: 'space-between',
        height: 60,
        borderRadius: 30,
    },

    it_will_cost: {
        textAlign: 'center',
        color: 'darkblue',
        top: -10,
    },

    total_text: {
        textAlign: 'center',
        color: '#00CC00',
        fontSize: 20,
        marginTop: 10,
    },

    total_text_header: {
        textAlign: 'center',
        fontSize: 23,
        fontWeight: 'bold',
        color: "#00CC00",
    }
})
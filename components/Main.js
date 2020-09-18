import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, RefreshControl, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';


export const Main = (props) => {

    const calculate_avg = () => {
        if (price && amount && avg_amount && current) {
            let a = (price * amount + avg_amount * current) / (avg_amount + amount)
            return a.toFixed(2);
        } else if (price) {
            return price;
        } else return 0;
    }

    const [price, setPrice] = useState(0);
    const [amount, setAmount] = useState(0);
    const [avg_amount, setAvgAmount] = useState(0);
    const [current, setCurrent] = useState(0);
    const [avg, setAvg] = useState(calculate_avg());

    const [edit_avg, setEditAvg] = useState(false);
    const [tmp_avg, setTmpAvg] = useState(0);
    const [comma, setComma] = useState(false); //Флаг, ввел ли пользователь точку/запятую. Так как parseFloat ее забывает, а рассчеты нужны

    const [refresh, setRefresh] = useState(false);

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
                setPrice(0);
            else if (t == 'amount')
                setAmount(0);
            else if (t == 'current')
                setCurrent(0);

            return;
        }

        if (!isNaN(val) && val > 0) {
            // Муки с разделителем 
            if (val[val.length - 1] == '.' || val[val.length - 1] == ',') //если пользователь ввел десятичный знак, запоминаем
                setComma(true);
            if (comma)
                setComma(false);

            if (t == 'avg_amount')
                setAvgAmount(parseInt(val, 10));
            else if (t == 'price') //берем остаток от деления на 10 (последняя цифра), плюсуем целой части от деления
                setPrice(comma ? (Math.trunc(parseFloat(val, 10) / 10) + (parseFloat(val, 10) % 10) / 10) : parseFloat(val, 10));
            else if (t == 'amount')
                setAmount(parseInt(val, 10));
            else if (t == 'current')
                setCurrent(comma ? (Math.trunc(parseFloat(val, 10) / 10) + (parseFloat(val, 10) % 10) / 10) : parseFloat(val, 10));
        }
    }

// Изменяя среднюю цену - изменяем необходимое количество акций
    const set_avg = (val) => {
        if (!isNaN(val) && price > 0 && amount > 0 && current > 0) {
            val = parseFloat(val, 10);
            if (val > Math.min(price, current) && val <= Math.max(price, current)) {
                let value = (price * amount - val * amount) / (current - val);
                setAvgAmount(-1 * Math.round(value));
            }
            setTmpAvg(parseFloat(val, 10));
        }
    }

//Рефрешер
    const handleRefresh = () => {
        setRefresh(true);
        setPrice(0);
        setAmount(0);
        setCurrent(0);
        setAvgAmount(0);
        setAvg(calculate_avg());
        setEditAvg(false);
        setRefresh(false);
    }


    return (
    <ScrollView
        refreshControl={<RefreshControl refreshing={refresh}
                                        onRefresh={handleRefresh} />}>
        <View style={styles.main_component}>

            <View>
                <Text style={styles.total_text_header}>Total position in share:</Text>
                <Text style={styles.total_text}>{
                    price && amount && avg_amount && current ? (price * amount + avg_amount * current).toFixed(2) : (price && amount ? (price * amount).toFixed(2) : '-/-')
                }</Text>
            </View>

            <View style={styles.previous_data}>
                <TextInput
                    style={styles.price}
                    placeholder='price'
                    value={price > 0 ? price.toString() : ''}
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
                value={edit_avg ? (tmp_avg > 0 ? tmp_avg.toString() : '') : (avg > 0 ? avg.toString() : '-/-')}
                onChangeText={(val) => set_avg(val)}
                onFocus={() => setEditAvg(true)}
                onBlur={() => {
                    setEditAvg(false);
                    setTmpAvg(0);
                }}
                editable={amount && price && current ? true : false}
                keyboardType={'phone-pad'}
                />
            </View>
 
        </View>
{/* Начинается блок для новой сделки */}
        <View style={styles.avg_block}>

                <Text style={styles.it_will_cost}>
                    It will cost you: {avg_amount && current ? (avg_amount * current).toFixed(2).toString() : '-/-'}
                </Text>

                <View style={styles.current}>

                    <TextInput
                        value={current > 0 ? current.toString() : ''}
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
                maximumValue={current < 10 ? 100 : 50}
                minimumTrackTintColor={'darkblue'}
                maximumTrackTintColor={'green'}
                thumbTintColor={'darkblue'}
                step={current < 10 ? 2 :1}
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
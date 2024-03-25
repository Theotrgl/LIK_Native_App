import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['id'] = {
    monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
};
LocaleConfig.defaultLocale = 'id';


const Form = () => {
    const [plat, setPlat] = useState('');
    const [driver, setDriver] = useState('');
    const [PO, setPO] = useState('');
    const [DO, setDO] = useState('');
    const [no_tiket, setNoTiket] = useState('');
    const [berat, setBerat] = useState('');
    const [tanggal, setTanggal] = useState(new Date());
    const [reject, setReject] = useState('');

    const handleSubmit = async() => {
        const d = tanggal.toISOString().slice(0, 10)
        const data = {
            plat,
            driver,
            PO,
            DO,
            no_tiket,
            berat,
            tanggal: d,
            reject
        }
        const response = await fetch('http://127.0.0.1:8000/api/add_report_mobile/', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(data)
        })

        const res = await response.json()
        console.log(res)
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Plat"
                value={plat}
                onChangeText={setPlat}
            />
            <TextInput
                style={styles.input}
                placeholder="Driver"
                value={driver}
                onChangeText={setDriver}
            />
            <TextInput
                style={styles.input}
                placeholder="Nomor PO"
                value={PO}
                onChangeText={setPO}
            />
            <TextInput
                style={styles.input}
                placeholder="Nomor DO"
                value={DO}
                onChangeText={setDO}
            />
            <TextInput
                style={styles.input}
                placeholder="Nomor Tiket"
                value={no_tiket}
                onChangeText={setNoTiket}
            />
            <TextInput
                style={styles.input}
                placeholder="Berat (Tonnase) *Dalam Kilogram"
                value={berat}
                onChangeText={setBerat}
            />
                <TextInput
                    style={styles.input}
                    placeholder="Reject *Dalam Kilogram"
                    value={reject}
                    onChangeText={setReject}
                />
                <Calendar
                    current={tanggal}
                    onDayPress={(day) => setTanggal(new Date(day.timestamp))}
                    style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5 }}
                    markedDates={{ [tanggal.toISOString().slice(0, 10)]: { selected: true, selectedColor: 'blue' } }}
                    theme={{
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: '#00adf5',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#00adf5',
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        dotColor: '#00adf5',
                        selectedDotColor: '#ffffff',
                        arrowColor: 'orange',
                        monthTextColor: 'blue',
                    }}
                />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        input: {
          width: '80%',
          height: 40,
          marginVertical: 10,
          paddingHorizontal: 10,
          borderColor: 'gray',
          borderWidth: 1,
          borderRadius: 5,
        },
      });

export default Form;

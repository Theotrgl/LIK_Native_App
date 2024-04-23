import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  Alert
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import LogoutButton from "../components/LogoutButton";
import COLORS from "../constants/colors";
import Button from "../components/Button";
import MyTextInput from "../components/InputField";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

LocaleConfig.locales["id"] = {
  monthNames: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};
LocaleConfig.defaultLocale = "id";

const Form = () => {
  const [plat, setPlat] = useState("BG ");
  const [driver, setDriver] = useState("");
  const [PO, setPO] = useState("");
  const [DO, setDO] = useState("");
  const [no_tiket, setNoTiket] = useState("I1900 731 ");
  const [berat, setBerat] = useState("");
  const [tanggal, setTanggal] = useState(new Date());
  const [reject, setReject] = useState("");
  const [tujuan, setTujuan] = useState(null);
  const [lokasi, setLokasi] = useState(null);
  const [tujuanOpt, setTujuanOpt] = useState([]);
  const [lokasiOpt, setLokasiOpt] = useState([]);
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  const fetchTujuanList = async () => {
    try {
      const groupID = await SecureStore.getItemAsync('GroupID');
      console.log(groupID);
      const response = await fetch(`http://192.168.1.49:8000/api/group/${groupID}/tujuan/`);
      if (!response.ok) {
        throw new Error('Failed to fetch Lokasi data');
      }
      const data = await response.json();
      // Now 'data' contains the Lokasi objects associated with the user's group
      setTujuanOpt(data);
      // Handle the data as needed in your React Native application
    } catch (error) {
      console.error('Error fetching Lokasi data:', error);
      // Handle errors gracefully
    }
  };
  
  const fetchLokasiList = async () => {
    try {
      const groupID = await SecureStore.getItemAsync('GroupID');
      console.log(groupID);
      const response = await fetch(`http://192.168.1.49:8000/api/group/${groupID}/lokasi/`);
      if (!response.ok) {
        throw new Error('Failed to fetch Lokasi data');
      }
      const data = await response.json();
      // Now 'data' contains the Lokasi objects associated with the user's group
      setLokasiOpt(data);
      // Handle the data as needed in your React Native application
    } catch (error) {
      console.error('Error fetching Lokasi data:', error);
      // Handle errors gracefully
    }
  };

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        // Token does not exist, navigate to login screen
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    checkToken();
    fetchTujuanList();
    fetchLokasiList();
    
  }, []);

  const handleSubmit = async () => {
    if (!plat || !driver || !PO || !DO || !no_tiket || !berat || !reject || !tujuan || !lokasi) {
      Alert.alert('Error', 'Semua kolom harus diisi.');
      return;
    }

    // VALIDATIONS
    const platRegex = /^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/;

    if (!platRegex.test(plat)) {
      Alert.alert('Error', 'Format plat nomor salah');
      return;
    }

    const intRegex = /^\d+$/; // Regex to match integers

    if ( !intRegex.test(DO) || !intRegex.test(berat) || !intRegex.test(reject)) {
      Alert.alert('Error', 'DO, Berat, dan Reject harus berupa angka bulat tanpa tanda baca.');
      return;
    }

    const poRegex = /^\d{2}\/\d{2}\/\d{4}$/; // Regex to match the format YY/MM/XXXX

    if (!poRegex.test(PO)) {
      Alert.alert('Error', 'Nomor PO harus dalam format YY/MM/XXXX. (Tahun/Bulan/NomorPO)');
      return;
    }

    

    const d = tanggal.toISOString().slice(0, 10);
    const data = {
      plat,
      driver,
      PO,
      DO,
      no_tiket,
      berat,
      tanggal: d,
      reject,
      lokasi: lokasi ? lokasi.nama : null,
      tujuan: tujuan ? tujuan.nama : null,
    };
    try {
      const response = await axios.post(
        "http://192.168.1.49:8000/api/add_report_mobile/",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const res = response.data;
      console.log(res);
      if (response.status == 200){
        Alert.alert("Sukses", "Data berhasil di simpan!");
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };
  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 }]}
        style={{ width: "100%" }}
      >
        <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
          <LogoutButton />
        </View>

        <View style={styles.container}>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Plat Nomor:"
              icon="truck"
              placeholder="BG 123 XY"
              value={plat}
              onChangeText={setPlat}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Nama Driver:"
              icon="user"
              placeholder=""
              value={driver}
              onChangeText={setDriver}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Nomor PO:"
              icon="file-text"
              placeholder="YY/MM/XXXX"
              value={PO}
              onChangeText={setPO}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Nomor DO:"
              icon="file-text"
              placeholder="XXX YYY"
              value={DO}
              onChangeText={setDO}
              keyboardType={'numeric'}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Nomor Tiket Timbang:"
              icon="file-text"
              placeholder="I1900 XXX XXX"
              value={no_tiket}
              onChangeText={setNoTiket}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Berat (Tonase)(KG):"
              icon="circle"
              placeholder="1000, 2000, ..."
              value={berat}
              onChangeText={setBerat}
              keyboardType={"numeric"}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Reject (KG):"
              icon="slash"
              placeholder="100, 200, ..."
              value={reject}
              onChangeText={setReject}
              keyboardType={"numeric"}
            />
          </View>
          <View>
            <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  marginVertical: 8,
                }}
              >
                Lokasi Pemotongan:
              </Text>
              <Picker
                selectedValue={lokasi}
                onValueChange={(itemValue, itemIndex) => setLokasi(itemValue)}
              >
                <Picker.Item key="default" label="Pilih Lokasi Potong" value={null} />
                {lokasiOpt.map((lokasi) => (
                  <Picker.Item key={lokasi.id} label={lokasi.nama} value={lokasi} />
                ))}
              </Picker>
          </View>

          <View>
            <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  marginVertical: 8,
                }}
              >
                Tujuan Pengiriman:
              </Text>
              <Picker
                selectedValue={tujuan}
                onValueChange={(itemValue, itemIndex) => setTujuan(itemValue)}
              >
                <Picker.Item key="default" label="Pilih Pabrik Tujuan" value={null} />
                {tujuanOpt.map((tujuan) => (
                  <Picker.Item key={tujuan.id} label={tujuan.nama} value={tujuan} />
                ))}
              </Picker>
              
          </View>
          
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                marginVertical: 8,
              }}
            >
              Tanggal Keluar:
            </Text>
            <Calendar
              current={tanggal.toISOString().split("T")[0]}
              onDayPress={(day) => setTanggal(new Date(day.timestamp))}
              style={styles.calendar}
              markedDates={{
                [tanggal.toISOString().slice(0, 10)]: {
                  selected: true,
                  selectedColor: "blue",
                },
              }}
              theme={styles.calendarTheme}
            />
          </View>
          <Button
            title="Submit"
            filled
            onPress={handleSubmit}
            style={{ marginTop: 22, width: "100%", maxWidth: 300 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  calendar: {
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 5,
    width: 300,
    marginBottom: 10,
  },
  calendarTheme: {
    calendarBackground: COLORS.white,
    textSectionTitleColor: "#b6c1cd",
    selectedDayBackgroundColor: "#00adf5",
    selectedDayTextColor: COLORS.white,
    todayTextColor: COLORS.info,
    dayTextColor: COLORS.grey,
    textDisabledColor: "#d9e1e8",
    dotColor: COLORS.primary,
    selectedDotColor: COLORS.info,
    arrowColor: COLORS.primary,
    monthTextColor: COLORS.primary,
  },
});

export default Form;

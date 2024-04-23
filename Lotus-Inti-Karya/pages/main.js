import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import LogoutButton from "../components/LogoutButton";
import COLORS from "../constants/colors";
import Button from "../components/Button";
import MyTextInput from "../components/InputField";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Navbar from "../components/Navbar";

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
  const navigation = useNavigation();

  useEffect(() => {
    checkToken();
  }, []);
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        // Token does not exist, navigate to login screen
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSubmit = async () => {
    if (!plat || !driver || !PO || !DO || !no_tiket || !berat || !reject) {
      Alert.alert("Error", "Semua kolom harus diisi.");
      return;
    }

    // VALIDATIONS
    const platRegex = /^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/;

    if (!platRegex.test(plat)) {
      Alert.alert("Error", "Format plat nomor salah");
      return;
    }

    const intRegex = /^\d+$/; // Regex to match integers

    if (!intRegex.test(DO) || !intRegex.test(berat) || !intRegex.test(reject)) {
      Alert.alert(
        "Error",
        "DO, Berat, dan Reject harus berupa angka bulat tanpa tanda baca."
      );
      return;
    }

    const poRegex = /^\d{2}\/\d{2}\/\d{4}$/; // Regex to match the format YY/MM/XXXX

    if (!poRegex.test(PO)) {
      Alert.alert(
        "Error",
        "Nomor PO harus dalam format YY/MM/XXXX. (Tahun/Bulan/NomorPO)"
      );
      return;
    }

    const tiketRegex = /^[A-Z]\d{4} \d{3} \d{3}$/;

    if (!tiketRegex.test(no_tiket)) {
      Alert.alert(
        "Error",
        "Nomor Tiket harus dalam format Ixxxx xxx xxx. Contoh: I1900 731 123"
      );
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
        Alert.alert("Sukses", "Data berhasil di simpan!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form fields
            setPlat("BG ");
            setDriver("");
            setPO("");
            setDO("");
            setNoTiket("I1900 731 ");
            setBerat("");
            setTanggal(new Date());
            setReject("");
          },
        },
      ]);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Error, Mohon coba lagi nanti");
    }
  };
  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 }]}
        style={{ width: "100%" }}
      >
        <Navbar />

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
              keyboardType={"numeric"}
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

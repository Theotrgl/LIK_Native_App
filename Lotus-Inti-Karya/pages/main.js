import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import COLORS from "../constants/colors";
import Button from "../components/Button";
import MyTextInput from "../components/InputField";

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
  const [plat, setPlat] = useState("");
  const [driver, setDriver] = useState("");
  const [PO, setPO] = useState("");
  const [DO, setDO] = useState("");
  const [no_tiket, setNoTiket] = useState("");
  const [berat, setBerat] = useState("");
  const [tanggal, setTanggal] = useState(new Date());
  const [reject, setReject] = useState("");

  const handleSubmit = async () => {
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
    const response = await fetch(
      "http://127.0.0.1:8000/api/add_report_mobile/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const res = await response.json();
    console.log(res);
  };
  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 }]}
        style={{ width: "100%" }}
      >
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
              label="Breat (Tonnase)(KG):"
              icon="circle"
              placeholder="1000, 2000, ..."
              value={berat}
              onChangeText={setBerat}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <MyTextInput
              label="Reject (KG):"
              icon="slash"
              placeholder="100, 200, ..."
              value={reject}
              onChangeText={setReject}
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

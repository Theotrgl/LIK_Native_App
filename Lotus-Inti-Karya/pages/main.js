import React, { useState } from "react";
import {
  ScrollView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Plat Nomor:</Text>
            <TextInput
              style={styles.input}
              placeholder="BG 123 XY"
              value={plat}
              onChangeText={setPlat}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Driver:</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={driver}
              onChangeText={setDriver}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor PO:</Text>
            <TextInput
              style={styles.input}
              placeholder="YY/MM/XXXX"
              value={PO}
              onChangeText={setPO}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor DO:</Text>
            <TextInput
              style={styles.input}
              placeholder="XXX YYY"
              value={DO}
              onChangeText={setDO}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor Tiket:</Text>
            <TextInput
              style={styles.input}
              placeholder="I1900 XXX XXX"
              value={no_tiket}
              onChangeText={setNoTiket}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Berat (Tonnase) *Dalam Kilogram:</Text>
            <TextInput
              style={styles.input}
              placeholder="1000, 2000, ..."
              value={berat}
              onChangeText={setBerat}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reject *Dalam Kilogram:</Text>
            <TextInput
              style={styles.input}
              placeholder="100, 200, ..."
              value={reject}
              onChangeText={setReject}
              placeholderTextColor="#999"
            />
          </View>
          <Text style={[styles.label, { alignSelf: "flex-start" }]}>
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
          <Button title="Submit" onPress={handleSubmit} style={styles.button} />
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
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 40,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    marginBottom: 10,
  },
  calendarTheme: {
    calendarBackground: "#ffffff",
    textSectionTitleColor: "#b6c1cd",
    selectedDayBackgroundColor: "#00adf5",
    selectedDayTextColor: "#ffffff",
    todayTextColor: "#00adf5",
    dayTextColor: "#2d4150",
    textDisabledColor: "#d9e1e8",
    dotColor: "#00adf5",
    selectedDotColor: "#ffffff",
    arrowColor: "blue",
    monthTextColor: "blue",
  },
  button: {
    marginTop: 10,
    paddingTop: 10,
    // paddingBottom: 20,
  },
});

export default Form;

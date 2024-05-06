import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  BackHandler,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../constants/colors";
import Button from "../components/Button";
import MyTextInput from "../components/InputField";
import PickerInput from "../components/Picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Navbar from "../components/Navbar";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../constants";

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
  const [no_tiket, setNoTiket] = useState("I1900 ");
  const [berat, setBerat] = useState("");
  const [tanggal, setTanggal] = useState(new Date());
  const [reject, setReject] = useState("");
  const [tujuan, setTujuan] = useState(null);
  const [lokasi, setLokasi] = useState(null);
  const [kayu, setKayu] = useState(null);
  const [tujuanOpt, setTujuanOpt] = useState([]);
  const [lokasiOpt, setLokasiOpt] = useState([]);
  const [kayuOpt, setKayuOpt] = useState([]);
  const [image, setImage] = useState(null);
  const [imageURI, setImageURI] = useState(null);
  const [dateAndTime, setDateAndTime] = useState(new Date());
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Image Processing Function
  const options = {
    title: "Select Image",
    type: "library",
    options: {
      maxHeight: 100,
      maxWidth: 100,
      selectionLimit: 1,
      mediaType: "photo",
      includeBase64: false,
    },
  };
  const GetImage = async () => {
    const images = await ImagePicker.launchImageLibraryAsync(options);
    // console.log(images.assets[0]);
    setImage(images);
    setImageURI(images.assets[0].uri);
  };

  const GetImageCamera = async () => {
    // Request camera permissions
    const status = await ImagePicker.requestCameraPermissionsAsync();

    // Check if permission is granted
    if (status.granted === false) {
      alert("Dibutuhkan akses kamera untuk fitur ini");
      return;
    } else {
      // Permission granted, launch camera
      const image = await ImagePicker.launchCameraAsync(options);
      if (!image.canceled) {
        // Image was captured successfully
        setImage(image);
        setImageURI(image.assets[0].uri);
      }
    }
  };
  // Fetch Tujuan and Lokasi  from API
  const fetchTujuanList = async () => {
    try {
      const groupID = await SecureStore.getItemAsync("GroupID");
      // console.log(groupID);
      const response = await fetch(
        (`${API_BASE_URL}/api/group/${groupID}/tujuan/`)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Lokasi data");
      }
      const data = await response.json();
      setTujuanOpt(data);
    } catch (error) {
      console.error("Error fetching Lokasi data:", error);
    }
  };

  const fetchLokasiList = async () => {
    try {
      const groupID = await SecureStore.getItemAsync("GroupID");
      // console.log(groupID);
      const response = await fetch(
        (`${API_BASE_URL}/api/group/${groupID}/lokasi/`)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Lokasi data");
      }
      const data = await response.json();
      setLokasiOpt(data);
    } catch (error) {
      console.error("Error fetching Lokasi data:", error);
    }
  };

  const fetchKayuList = async () => {
    try {
      const groupID = await SecureStore.getItemAsync("GroupID");
      // console.log(groupID);
      const response = await fetch(
        (`${API_BASE_URL}/api/group/${groupID}/kayu/`)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Lokasi data");
      }
      const data = await response.json();
      setKayuOpt(data);
    } catch (error) {
      console.error("Error fetching Lokasi data:", error);
    }
  };

  // Token State Check Function
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      
      if (!token) {
        // Token does not exist, navigate to login screen
        navigation.navigate("Login");
      } else {
        // Token exists, check with server
        const user_id = await SecureStore.getItemAsync("User");
        
        const response = await axios.get(`${API_BASE_URL}/api/check_token/${user_id}/`);
        
        if (response.status === 200) {
          const userToken = response.data.token;
          if (userToken !== token) {
            // Token from server does not match token from SecureStore
            // Delete token from SecureStore and navigate to login screen
            await SecureStore.deleteItemAsync("authToken");
            Alert.alert('Masa Token Habis', 'Dimohon Untuk Login Kembali!');
            navigation.navigate("Login");
          } else {
          }
        } else if (response.status === 404) {
          // Token not found for the user, delete token from SecureStore and navigate to login screen
          await SecureStore.deleteItemAsync("authToken");
          Alert.alert('Masa Token Habis', 'Dimohon Untuk Login Kembali!');
          navigation.navigate("Login");
        } else {
          // Handle other error statuses
          console.log("Error:", response.data);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const checkDateAndTime = () => {
    const currentDateAndTime = new Date();
    setDateAndTime(currentDateAndTime.toISOString())
    // console.log(dateAndTime);
  }
  const handleRefresh = () => {
    setPlat("BG ");
    setDriver("");
    setPO("");
    setDO("");
    setNoTiket("I1900 ");
    setBerat("");
    setTanggal(new Date());
    setReject("");
    setTujuan(null);
    setLokasi(null);
    setKayu(null);
    setImage(null);
    setDateAndTime(new Date());
    console.log("Refreshing1: ",refreshing);
    setRefreshing(true);
  };

  useEffect(() => {
    checkToken();
    fetchTujuanList();
    fetchLokasiList();
    fetchKayuList();
    checkDateAndTime();
    setFormSubmitted(false);
    setRefreshing(false);
    console.log("Refreshing: ",refreshing);
    console.log("formSubmitted1: ",formSubmitted);
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [formSubmitted, refreshing]);

  const handleSubmit = async () => {
    const userID = await SecureStore.getItemAsync("User");
    if (
      !plat ||
      !driver ||
      !PO ||
      !DO ||
      !no_tiket ||
      !berat ||
      !reject ||
      !tujuan ||
      !lokasi||
      !kayu
    ) {
      Alert.alert("Error", "Semua kolom harus diisi.");
      return;
    }

    // VALIDATIONS
    const platRegex = /^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/i;

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

    const currentDateAndTime = new Date();
    setDateAndTime(currentDateAndTime.toISOString());

    // console.log(image);
    const d = tanggal.toISOString().slice(0, 10);
    const formData = new FormData();
    formData.append("plat", plat);
    formData.append("driver", driver);
    formData.append("PO", PO);
    formData.append("DO", DO);
    formData.append("no_tiket", no_tiket);
    formData.append("berat", berat);
    formData.append("tanggal", d);
    formData.append("reject", reject);
    formData.append("lokasi", lokasi ? lokasi.nama : null);
    formData.append("tujuan", tujuan ? tujuan.nama : null);
    formData.append("kayu", kayu ? kayu.nama : null);
    formData.append("foto", {
      uri: image.assets[0].uri,
      type: image.assets[0].mimeType,
      name: image.assets[0].fileName,
    });
    formData.append("date_time", dateAndTime);
    formData.append("sender", userID);
    // console.log(formData);
    setLoading(true);
    try {
      const response = await axios.post(
        (`${API_BASE_URL}/api/add_report_mobile/`),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Reset form fields
      setPlat("BG ");
      setDriver("");
      setPO("");
      setDO("");
      setNoTiket("I1900 ");
      setBerat("");
      setTanggal(new Date());
      setReject("");
      setTujuan(null);
      setLokasi(null);
      setKayu(null);
      setImage(null);
      setDateAndTime(new Date());

      
      // const res = response.status;
      // console.log("response =" + res);
      if (response.status == 201 || res == 200) {
        Alert.alert("Sukses", "Data berhasil di simpan!", [
          {text: "OK",
          onPress: () => {
          setFormSubmitted(true);
          },
        },
      ]
    );
    console.log("formSubmitted: ", formSubmitted);
      }
    } catch (error) {
      checkToken();
      setRefreshing(true)
      console.error("Error:", error);
      Alert.alert("Error", "Error, Mohon coba lagi nanti");
    } finally {
      setLoading(false);
    }
  };
  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 }]}
        style={{ width: "100%" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9Bd35A', '#689F38']}
            // You can also set other props like progressBackgroundColor, size, etc.
          />
        }
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
              label="Berat Netto (KG):"
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
            <PickerInput
              label="Jenis Kayu"
              data={kayuOpt}
              onSelect={setKayu} // Pass the setter function to handle the selected value
            />
            <PickerInput
              label="Lokasi Pemotongan"
              data={lokasiOpt}
              onSelect={setLokasi} // Pass the setter function to handle the selected value
            />
            <PickerInput
              label="Tujuan Pengiriman"
              data={tujuanOpt}
              onSelect={setTujuan} // Pass the setter function to handle the selected value
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
          <View style={styles.buttonContainer}>
            <Button
              title="Pilih Foto"
              filled
              onPress={GetImage}
              style={styles.buttonSideBySide}
              color={COLORS.secondary}
              borderColor={COLORS.secondary}
              icon="image"
            />
            <Button
              title="Buka Kamera"
              filled
              onPress={GetImageCamera}
              style={styles.buttonSideBySide}
              color={COLORS.success}
              borderColor={COLORS.success}
              icon="camera"
            />
          </View>
          <View>
            {image && (
              <Image
                source={{ uri: imageURI }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </View>
          {!loading && (
            <Button
              title="Kirim"
              onPress={handleSubmit}
              style={{ marginTop: 12, width: "100%", maxWidth: 300 }}
            />
          )}
      <Text>{loading && <ActivityIndicator style={{ marginTop: 20 }} />}</Text>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20, // Adjust as needed
  },
  buttonSideBySide: {
    flex: 1, // Each button takes equal space
    marginHorizontal: 5, // Adjust spacing between buttons
    marginBottom: 12,
  },
});

export default Form;

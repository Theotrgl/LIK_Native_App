import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  BackHandler,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import * as SecureStore from "expo-secure-store";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { useNavigation } from "@react-navigation/native";

const ReportSummary = () => {
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigation = useNavigation();

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        // Token does not exist, navigate to login screen
        navigation.navigate("Login");
      } else {
        // Token exists, check with server
        const user_id = await SecureStore.getItemAsync("User");

        const response = await axios.get(
          `${API_BASE_URL}/api/check_token/${user_id}/`
        );

        if (response.status === 200) {
          const userToken = response.data.token;
          if (userToken !== token) {
            // Token from server does not match token from SecureStore
            // Delete token from SecureStore and navigate to login screen
            await SecureStore.deleteItemAsync("authToken");
            Alert.alert("Masa Token Habis", "Dimohon Untuk Login Kembali!");
            navigation.navigate("Login");
          } else {
          }
        } else if (response.status === 404) {
          // Token not found for the user, delete token from SecureStore and navigate to login screen
          await SecureStore.deleteItemAsync("authToken");
          Alert.alert("Masa Token Habis", "Dimohon Untuk Login Kembali!");
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

  const fetchSummary = async () => {
    const senderId = await SecureStore.getItemAsync("User");
    const url = `${API_BASE_URL}/api/report-summary/${senderId}/`;
    const params = {
      start_date: startDate, // Pass start date parameter
      end_date: endDate, // Pass end date parameter
    };
    axios
      .get(url, { params })
      .then((response) => {
        setSummary(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the summary!", error);
      });
  };
  const handleRefresh = async () => {
    setRefreshing(true); // Set refreshing to true first
  
    // Check token
    await checkToken();
  
    // Fetch summary data
    await fetchSummary();
  
    // Set refreshing to false after fetching data
    setRefreshing(false);
  };
  
  useEffect(() => {
    checkToken();
    if (refreshing) {
      fetchSummary().then(() => {
        setRefreshing(false); // Set refreshing to false after fetching data
      });
    };
    fetchSummary();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const goToFormPage = () => {
    checkToken();
    navigation.navigate('Form'); // Navigate to the 'Form' page
  };
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.kayu}</Text>
      <Text style={styles.cell}>{item.total_plat}</Text>
    </View>
  );

  const handleDateRangeFilter = (dateRange) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let startDateStr, endDateStr;
  
    const currentMonth = currentDate.getMonth() + 1;
  
    if (dateRange === "1-10") {
      startDateStr = `${currentYear}-${currentMonth}-01`;
      endDateStr = `${currentYear}-${currentMonth}-10`;
    } else if (dateRange === "11-20") {
      startDateStr = `${currentYear}-${currentMonth}-11`;
      endDateStr = calculateEndDate(currentYear, currentMonth, 20);
    } else if (dateRange === "21-30") {
      startDateStr = `${currentYear}-${currentMonth}-21`;
      endDateStr = calculateEndDate(currentYear, currentMonth, 30);
    } else {
      // Default to current month if no valid date range is selected
      startDateStr = `${currentYear}-${currentMonth}-01`;
      endDateStr = calculateEndDate(currentYear, currentMonth, 30);
    }
  
    setRefreshing(true); // Set refreshing to true before fetching data
  
    setStartDate(startDateStr);
    setEndDate(endDateStr);
  
    fetchSummary().then(() => {
      setRefreshing(false); // Set refreshing to false after fetching data
    });
  };
  
  const calculateEndDate = (year, month, day) => {
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDay = Math.min(day, lastDayOfMonth);
    return `${year}-${month.toString().padStart(2, "0")}-${endDay.toString().padStart(2, "0")}`;
  };

  const statusBarHeight = StatusBar.currentHeight || 0;

  const ListHeader = () => (
    <View>
        <Navbar />
        <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Kayu</Text>
            <Text style={styles.headerCell}>Mobil</Text>
        </View>
    </View>
);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
    <FlatList
      data={summary}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={ListHeader}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={styles.listContainer}
    />
    <View style={styles.buttonContainer}>
      <Button
      title="1-10"
      filled
      onPress={() => handleDateRangeFilter("1-10")}
      />
      <Button
      title="11-20"
      filled
      onPress={() => handleDateRangeFilter("11-20")}
      />
      <Button
      title="21-30"
      filled
      onPress={() => handleDateRangeFilter("21-30")}
      />
      <Button
      title="Isi Data Tiket Timbang"
      filled
      onPress={goToFormPage}
      />
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
},
listContainer: {
    paddingBottom: 40,
    flexGrow: 1,
    paddingHorizontal: 20,
    marginTop: 20,
},
headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
},
row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 10,
},
headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
},
cell: {
    flex: 1,
    textAlign: 'center',
},
});

export default ReportSummary;
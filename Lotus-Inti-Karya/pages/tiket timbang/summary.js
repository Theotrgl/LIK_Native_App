import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../../constants/constants";
import * as SecureStore from "expo-secure-store";
import Navbar from "../../components/Navbar";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

const ReportSummary = () => {
  const [summary, setSummary] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState(null);
  const navigation = useNavigation();

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        navigation.navigate("Login");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token check error:", error);
      return false;
    }
  };

  const fetchSummary = async (startDate = null, endDate = null) => {
    try {
      const senderId = await SecureStore.getItemAsync("User");
      if (!senderId) throw new Error("User ID not found");

      const params = {
        start_date: startDate,
        end_date: endDate,
      };

      console.log("Request URL:", `${API_BASE_URL}/api/report-summary/${senderId}/`);
      console.log("Params:", params);

      const response = await axios.get(
        `${API_BASE_URL}/api/report-summary/${senderId}/`,
        {
          params,
          headers: {
            "Authorization": `Token ${await SecureStore.getItemAsync("authToken")}`
          }
        }
      );

      console.log("Response:", response.data);
      setSummary(response.data);
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  const handleDateRangeFilter = (period) => {
    setActivePeriod(period);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthStr = currentMonth.toString().padStart(2, "0");

    let startDay, endDay;

    if (period === "1-10") {
      startDay = "01";
      endDay = "10";
    } else if (period === "11-20") {
      startDay = "11";
      endDay = "20";
    } else if (period === "21-31") {
      startDay = "21";
      endDay = new Date(currentYear, currentMonth, 0).getDate(); // Last day of month
    }

    const startDate = `${currentYear}-${monthStr}-${startDay}`;
    const endDate = `${currentYear}-${monthStr}-${endDay.toString().padStart(2, "0")}`;

    setLoading(true);
    fetchSummary(startDate, endDate);
  };

  useEffect(() => {
    const initialize = async () => {
      const tokenValid = await checkToken();
      if (tokenValid) {
        fetchSummary();
      }
    };
    initialize();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.kayu}</Text>
      <View style={styles.itemCountContainer}>
        <Text style={styles.itemCount}>{item.total_plat}</Text>
        <Feather name="truck" size={16} color={COLORS.primary} />
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Ringkasan Pengiriman</Text>
      <Text style={styles.headerSubtitle}>
        {activePeriod ? `Periode ${activePeriod}` : "Semua Data"}
      </Text>
    </View>
  );

  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <Navbar title="Ringkasan Pengiriman" showBackButton={true} navigation={navigation} color="#1a73e8"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, activePeriod === "1-10" && styles.activeFilter]}
              onPress={() => handleDateRangeFilter("1-10")}
            >
              <Text style={styles.filterButtonText}>1-10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activePeriod === "11-20" && styles.activeFilter]}
              onPress={() => handleDateRangeFilter("11-20")}
            >
              <Text style={styles.filterButtonText}>11-20</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activePeriod === "21-31" && styles.activeFilter]}
              onPress={() => handleDateRangeFilter("21-31")}
            >
              <Text style={styles.filterButtonText}>21-31</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, !activePeriod && styles.activeFilter]}
              onPress={() => {
                setActivePeriod(null);
                fetchSummary();
              }}
            >
              <Text style={styles.filterButtonText}>Semua</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={summary}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={ListHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="package" size={40} color={COLORS.gray} />
                <Text style={styles.emptyText}>Tidak ada data pengiriman</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.dark,
    fontWeight: "500",
  },
  activeFilterText: {
    color: COLORS.white,
  },
  listContainer: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.dark,
  },
  itemCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default ReportSummary;
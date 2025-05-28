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

const PattyCashSummary = () => {
    const [summary, setSummary] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
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

    const getDateRange = () => {
        const now = new Date();
        let startDate, endDate;

        if (activeFilter === "today") {
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
        } else if (activeFilter === "this-month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Default to current month if no filter or "all"
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        return {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        };
    };

    const fetchSummaryPetty = async () => {
        try {
            const senderId = await SecureStore.getItemAsync("User");
            const token = await SecureStore.getItemAsync("authToken");
            if (!senderId || !token) return;

            const dateRange = getDateRange();

            const response = await axios.get(`${API_BASE_URL}/api/pettycash/summary/${senderId}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
                params: {
                    start_date: dateRange.start_date,
                    end_date: dateRange.end_date
                }
            });

            setSummary(response.data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSummaryPetty();
        setRefreshing(false);
    };

    useEffect(() => {
        const initialize = async () => {
            const tokenValid = await checkToken();
            if (tokenValid) {
                fetchSummaryPetty();
            }
        };
        initialize();
    }, [activeFilter]); // Refetch when filter changes

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} activeOpacity={1}>
            <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.pegawai_nama || 'No Name'}</Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>
                    Rp {item.total_uang_keluar ? parseInt(item.total_uang_keluar).toLocaleString("id-ID") : '0'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const calculateTotal = () => {
        return summary.reduce((sum, item) => {
            const amount = parseInt(item?.total_uang_keluar) || 0;
            return sum + amount;
        }, 0);
    };

    const ListHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Summary Patty Cash</Text>
            <Text style={styles.headerSubtitle}>
                Total Pengeluaran: Rp {calculateTotal().toLocaleString("id-ID")}
            </Text>
            <Text style={styles.headerDateRange}>
                Periode: {getDateRange().start_date} - {getDateRange().end_date}
            </Text>
        </View>
    );

    const statusBarHeight = StatusBar.currentHeight || 0;

    return (
        <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
            <Navbar title="Patty Cash" showBackButton={true} navigation={navigation} color="#2a7f62" />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === "all" && styles.activeFilter]}
                            onPress={() => setActiveFilter("all")}
                        >
                            <Text style={[styles.filterButtonText, activeFilter === "all" && styles.activeFilterText]}>
                                Semua
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === "today" && styles.activeFilter]}
                            onPress={() => setActiveFilter("today")}
                        >
                            <Text style={[styles.filterButtonText, activeFilter === "today" && styles.activeFilterText]}>
                                Hari Ini
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === "this-month" && styles.activeFilter]}
                            onPress={() => setActiveFilter("this-month")}
                        >
                            <Text style={[styles.filterButtonText, activeFilter === "this-month" && styles.activeFilterText]}>
                                Bulan Ini
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={summary}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item?.pegawai_id?.toString() || index.toString()}
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
                                <Feather name="file-text" size={40} color={COLORS.gray} />
                                <Text style={styles.emptyText}>Tidak ada data</Text>
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
    headerDateRange: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
        fontStyle: 'italic',
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
    itemLeft: {
        flex: 1,
        marginRight: 10,
    },
    itemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    itemName: {
        fontSize: 16,
        color: COLORS.dark,
        marginBottom: 4,
    },
    itemAmount: {
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

export default PattyCashSummary;
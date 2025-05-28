import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Platform
} from "react-native";
import Login from "../pages/auth/login";
import Form from "../pages/tiket timbang/main";
import ReportSummary from "../pages/tiket timbang/summary";
import PattyCashForm from "../pages/petty cash/pattyCash";
import PattyCashSummary from "../pages/petty cash/pattyCashSummary";
import COLORS from "../constants/colors";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/constants";

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallDevice = width < 375;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Menu Component
const MainMenuScreen = ({ navigation }) => {
  const [hasPettyCashAccess, setHasPettyCashAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const [employeesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/pettycash/pegawai/`, {
            headers: { "Authorization": `Token ${token}` }
          })
        ]);

        const hasEmployees = employeesRes.data && employeesRes.data.length > 0;

        setHasPettyCashAccess(hasEmployees);
      } catch (error) {
        console.error("Error checking petty cash access:", error);
        setHasPettyCashAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  const menuItems = [
    {
      title: "TIKET TIMBANG",
      subtitle: "Formulir penimbangan kendaraan",
      icon: "file-text",
      color: '#1a73e8',
      borderColor: '#0d5bb8',
      screen: "TimbangTab",
      alwaysEnabled: true
    },
    {
      title: "PETTY CASH",
      subtitle: "Pengelolaan keuangan",
      icon: "dollar-sign",
      color: '#2a7f62',
      borderColor: '#1e6a4f',
      screen: "PattyCashTab",
      alwaysEnabled: false
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>PILIH MENU</Text>

        <View style={styles.buttonsContainer}>
          {menuItems.map((item, index) => {
            const isDisabled = !item.alwaysEnabled && !hasPettyCashAccess;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: isDisabled ? COLORS.gray : item.color,
                    borderColor: isDisabled ? COLORS.grayDark : item.borderColor,
                    opacity: isDisabled ? 0.7 : 1
                  }
                ]}
                onPress={() => !isDisabled && navigation.navigate(item.screen)}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <View style={styles.iconContainer}>
                  <Feather
                    name={item.icon}
                    size={isTablet ? 70 : isSmallDevice ? 40 : 50}
                    color={COLORS.white}
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text
                    style={styles.menuButtonText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={styles.menuButtonSubtext}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {isDisabled ? "Fitur tidak tersedia" : item.subtitle}
                  </Text>
                </View>

                {!isDisabled && (
                  <Feather
                    name="chevron-right"
                    size={isTablet ? 50 : isSmallDevice ? 30 : 40}
                    color="rgba(255,255,255,0.9)"
                    style={styles.arrowIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PT. Lotus Inti Karya</Text>
          <Text style={styles.footerText}>Versi 1.1.3</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Timbang Tab Navigator (tanpa home)
const TimbangTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'InputTimbang') {
            iconName = focused ? 'file-text' : 'file-plus';
          } else if (route.name === 'RiwayatTimbang') {
            iconName = focused ? 'book-open' : 'book';
          }
          return <Feather name={iconName} size={isTablet ? 40 : isSmallDevice ? 24 : 28} color={color} />;
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontSize: isTablet ? 16 : isSmallDevice ? 10 : 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarStyle: {
          height: isTablet ? 100 : isSmallDevice ? 60 : 70,
          paddingBottom: Platform.OS === 'ios' ? (isSmallDevice ? 5 : 10) : 0,
          paddingTop: 5,
          borderTopWidth: 2,
          borderTopColor: '#f0f0f0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="InputTimbang"
        component={Form}
        options={{
          tabBarLabel: 'INPUT TIMBANG',
          title: 'Input Timbang'
        }}
      />
      <Tab.Screen
        name="RiwayatTimbang"
        component={ReportSummary}
        options={{
          tabBarLabel: 'RIWAYAT',
          title: 'Riwayat Timbang'
        }}
      />
    </Tab.Navigator>
  );
};

// Patty Cash Tab Navigator (tanpa home)
const PattyCashTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'InputPattyCash') {
            iconName = focused ? 'edit-2' : 'edit';
          } else if (route.name === 'RiwayatPattyCash') {
            iconName = focused ? 'list' : 'archive';
          }
          return <Feather name={iconName} size={isTablet ? 40 : isSmallDevice ? 24 : 28} color={color} />;
        },
        tabBarActiveTintColor: '#2a7f62',
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontSize: isTablet ? 16 : isSmallDevice ? 10 : 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarStyle: {
          height: isTablet ? 100 : isSmallDevice ? 60 : 70,
          paddingBottom: Platform.OS === 'ios' ? (isSmallDevice ? 5 : 10) : 0,
          paddingTop: 5,
          borderTopWidth: 2,
          borderTopColor: '#f0f0f0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="InputPattyCash"
        component={PattyCashForm}
        options={{
          tabBarLabel: 'INPUT PETTY CASH',
          title: 'Input Petty Cash'
        }}
      />
      <Tab.Screen
        name="RiwayatPattyCash"
        component={PattyCashSummary}
        options={{
          tabBarLabel: 'RIWAYAT',
          title: 'Riwayat Petty Cash'
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack
const RootStack = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" backgroundColor="#f8f9fa" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="TimbangTab" component={TimbangTabNavigator} />
        <Stack.Screen name="PattyCashTab" component={PattyCashTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles tetap sama seperti sebelumnya
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: "center",
    padding: isTablet ? 30 : isSmallDevice ? 10 : 20,
    backgroundColor: '#f8f9fa',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: isTablet ? 700 : 500,
    marginTop: isSmallDevice ? 10 : 20,
  },
  menuTitle: {
    fontSize: isTablet ? 42 : isSmallDevice ? 24 : 32,
    fontWeight: "bold",
    marginVertical: isSmallDevice ? 15 : 30,
    textAlign: "center",
    color: '#2c3e50',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: isTablet ? 35 : isSmallDevice ? 15 : 25,
    borderRadius: 25,
    marginVertical: isTablet ? 25 : isSmallDevice ? 10 : 15,
    width: "100%",
    minHeight: isTablet ? 180 : isSmallDevice ? 100 : 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
  },
  iconContainer: {
    width: isTablet ? 100 : isSmallDevice ? 50 : 70,
    height: isTablet ? 100 : isSmallDevice ? 50 : 70,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: isTablet ? 30 : isSmallDevice ? 10 : 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 32 : isSmallDevice ? 16 : 24,
    fontWeight: "700",
    marginBottom: 5,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuButtonSubtext: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: isTablet ? 24 : isSmallDevice ? 12 : 16,
    fontWeight: "500",
  },
  arrowIcon: {
    marginLeft: 5,
  },
  footer: {
    marginTop: isSmallDevice ? 20 : 40,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.gray,
    fontSize: isTablet ? 22 : isSmallDevice ? 12 : 16,
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default RootStack;
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "../pages/login";
import Form from "../pages/main";
import ReportSummary from "../pages/summary";
import COLORS from "../constants/colors";
import { Feather } from "@expo/vector-icons";
import Navbar from "../components/Navbar";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator()

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Isi Form") {
            iconName = focused ? "file-text" : "file-plus";
          } else if (route.name === "Sejarah Input") {
            iconName = focused ? "book-open" : "book";
          }

          // You can return any component here as the icon
          return <Feather name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        activeTintColor: COLORS.primary,
        inactiveTintColor: COLORS.gray,
      })}
    // screenOptions={{
    //   headerShown: false,
    // }}
    >
      <Tab.Screen name="Isi Form" component={Form} />
      <Tab.Screen name="Sejarah Input" component={ReportSummary} />
    </Tab.Navigator>
  );
};

const RootStack = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyled: {
            backgroundColor: "transparent",
          },
          headerTintColor: COLORS.primary,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: null,
          headerLeftContainerStyle: { paddingLeft: 20 },
          headerShown: false
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={Login} />
        {/* <Stack.Screen name="Summary" component={ReportSummary} />
        <Stack.Screen name="Form" component={Form} /> */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;

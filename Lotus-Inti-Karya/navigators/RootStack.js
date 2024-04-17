import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../pages/login";
import Register from "../pages/register";
import Form from "../pages/main";
import COLORS from "../constants/colors";

const Stack = createStackNavigator();

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
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Form" component={Form} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;

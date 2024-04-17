import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import MyTextInput from "../components/InputField";
import Button from "../components/Button";
import COLORS from "../constants/colors";
// import { retrieveToken } from "../auth/auth";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // useEffect(() => {
  //   checkAuthenticationStatus();
  // }, []);

  // const checkAuthenticationStatus = async () => {
  //   const token = await retrieveToken();
  //   if (token) {
  //     navigation.navigate("Form");
  //   }
  //   // navigation.navigate("Form")
  // };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("All fields are required");
      return;
    }
    try {

      const response = await axios.post('http://192.168.1.49:8000/api/login_user/', {
        username: username,
        password: password
      }, {

        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        const data = response.data;
        const token = data.token;
        await SecureStore.setItemAsync('authToken', token);
        console.log(token)
        // Store token securely using authUtils storeToken function
        Alert.alert("Success", "Logged in successfully");
        navigation.navigate("Form")
        // Handle navigation to next screen or other actions after successful login
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Server responded with status code:", error.response.status);
        if (error.response.status === 401) {
          // Handle unauthorized (invalid credentials) error
          Alert.alert("Error", "Invalid username or password");
        } else {
          // Handle other server errors
          Alert.alert("Error", "Something went wrong with the server");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Request was made but no response received");
        Alert.alert("Error", "No response from server");
      } else {
        // Something else happened in making the request
        console.log("Error while making the request:", error.message);
        Alert.alert("Error", "Something went wrong");
      }
    }
  };

  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={{ marginVertical: 22 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginVertical: 12,
            color: COLORS.black,
          }}
        >
          Login
        </Text>
      </View>
      <View>
        <View style={{ marginBottom: 12 }}>
          <MyTextInput
            label="Username:"
            icon="user"
            placeholder="Masukkan Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={{ marginBottom: 12 }}>
          <MyTextInput
            label="Password:"
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>
        <Button
          title="Login"
          onPress={handleLogin}
          filled
          style={{ marginTop: 18, marginBottom: 4 }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 22,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.black }}>
            Belum punya akun?
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.primary,
                fontWeight: "bold",
                marginLeft: 6,
              }}
            >
              Register
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default Login;

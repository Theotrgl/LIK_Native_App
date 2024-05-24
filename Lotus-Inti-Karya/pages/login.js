import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  Alert,
  BackHandler
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import MyTextInput from "../components/InputField";
import Button from "../components/Button";
import COLORS from "../constants/colors";
// import { retrieveToken } from "../auth/auth";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from "../constants";

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkToken();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, []);
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        navigation.navigate('Main');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Semua Kolom Wajib Di isi!");
      return;
    }
    try {

      const response = await axios.post((`${API_BASE_URL}/api/login_user/`),{
        username: username,
        password: password
      }, {

        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        const token = data.token;
        const groupID = data.groups.toString();
        const userID = data.user.id.toString();
        await SecureStore.setItemAsync('User', userID);
        await SecureStore.setItemAsync('GroupID', groupID);
        await SecureStore.setItemAsync('authToken', token);
        console.log(token)
        // Store token securely using authUtils storeToken function
        Alert.alert("Sukses", "Berhasil Masuk");
        setPassword("");
        setUsername("");
        navigation.navigate("Main")
        // Handle navigation to next screen or other actions after successful login
      } else {
        Alert.alert("Error", "Akun Tidak Terdaftar");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Server responded with status code:", error.response.status);
        if (error.response.status === 401) {
          // Handle unauthorized (invalid credentials) error
          Alert.alert("Error", "Username atau Password Salah");
        } else {
          // Handle other server errors
          Alert.alert("Error", "Ada masalah dengan server");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Request was made but no response received");
        Alert.alert("Error", "Tidak ada respons dari server");
      } else {
        // Something else happened in making the request
        console.log("Error while making the request:", error.message);
        Alert.alert("Error", "Terjadi error");
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
          title="Masuk"
          onPress={handleLogin}
          filled
          style={{ marginTop: 18, marginBottom: 4 }}
        />
        {/* <View
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
        </View> */}
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

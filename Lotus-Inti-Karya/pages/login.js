import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import MyTextInput from "../components/InputField";
import Button from "../components/Button";
import COLORS from "../constants/colors";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    
    if (!username || !email) {
      Alert.alert("All fields are required");
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        // Store token securely using authUtils storeToken function
        Alert.alert('Success', 'Logged in successfully');
        // Handle navigation to next screen or other actions after successful login
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
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
          title="Register"
          onPress={handleLogin}
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
          <Pressable onPress={() => navigation.navigate("register")}>
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
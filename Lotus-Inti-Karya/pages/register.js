import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Pressable,
} from "react-native";
import COLORS from "../constants/colors";
import Button from "../components/Button";
import MyTextInput from "../components/InputField";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password ) {       //|| !confirmPassword) {
      Alert.alert("All fields are required");
      return;
    }

    // if (password !== confirmPassword) {
    //   Alert.alert("Passwords do not match");
    //   return;
    // }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to register user');
      }
  
      // Handle successful registration
      Alert.alert('Success', 'User registered successfully');
      // Clear input fields or navigate to login screen, etc.
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to register user ');
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
          Buat Akun
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
            label="Alamat Email:"
            icon="mail"
            placeholder="Masukkan Alamat Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
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

        <View style={{ marginBottom: 12 }}>
          <MyTextInput
            label="Konfirmasi Password:"
            icon="lock"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
          />
        </View>

        <Button
          title="Register"
          onPress={handleRegister}
          filled
          style={{
            marginTop: 18,
            marginBottom: 4,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 22,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.black }}>
            Sudah punya akun?
          </Text>
          <Pressable onPress={() => navigation.navigate("login")}>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.primary,
                fontWeight: "bold",
                marginLeft: 6,
              }}
            >
              Login
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

export default Register;

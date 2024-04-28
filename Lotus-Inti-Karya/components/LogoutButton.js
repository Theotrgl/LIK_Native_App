import React from "react";
import { View, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../constants";

const LogoutButton = () => {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      // Get the authentication token from the storage (assuming you store it there)
      const authToken = await SecureStore.getItemAsync('authToken');
      console.log(authToken);
      const response = await axios.post(
        `${API_BASE_URL}/api/logout_user/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            // Include the authentication token if required
            Authorization: `Token ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        navigation.navigate("Login");
        await SecureStore.deleteItemAsync("authToken");
        const tokenCheck = await SecureStore.getItemAsync("authToken");
        if (tokenCheck) {
          console.log(tokenCheck);
        } else {
          console.log("Token Deleted Successfully");
        }
        Alert.alert("Berhasil Keluar");
        // Perform navigation to login screen or any other action after logout
      } else {
        Alert.alert("Gagal Keluar");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Terjadi Error Ketika Keluar");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LogoutButton;

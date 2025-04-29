import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../constants";

const LogoutButton = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const forceLogout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const authToken = await SecureStore.getItemAsync("authToken");

      // Jika tidak ada token, langsung bersihkan dan arahkan ke login
      if (!authToken) {
        await forceLogout();
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/logout_user/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
          timeout: 5000, // timeout 5 detik
        }
      );

      if (response.status === 200) {
        await forceLogout();
        Alert.alert("Berhasil Keluar", "Anda telah keluar dari aplikasi");
      } else {
        Alert.alert(
          "Peringatan",
          "Gagal melakukan logout dari server",
          [
            {
              text: "Keluar Lokal",
              onPress: () => forceLogout(),
            },
            {
              text: "Coba Lagi",
              onPress: () => handleLogout(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Logout Error:", error);

      // Jika error 401 (Unauthorized) atau network error
      if (error.response?.status === 401 || error.code === "ECONNABORTED") {
        Alert.alert(
          "Sesi Berakhir",
          "Sesi Anda telah berakhir atau terjadi masalah jaringan",
          [
            {
              text: "OK",
              onPress: () => forceLogout(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Terjadi Kesalahan",
          "Tidak dapat keluar. Coba lagi atau hubungi admin.",
          [
            {
              text: "Keluar Paksa",
              onPress: () => forceLogout(),
              style: "destructive",
            },
            {
              text: "Batal",
              style: "cancel",
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LogoutButton;
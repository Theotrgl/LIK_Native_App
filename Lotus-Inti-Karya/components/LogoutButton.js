import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../constants/constants";

const LogoutButton = ({ iconOnly = false }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);

  const forceLogout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const logoutToMenu = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainMenu" }] });
    setShowLogoutOptions(false);
  };

  const handleLogoutAccount = async () => {
    setLoading(true);
    setShowLogoutOptions(false);

    try {
      const authToken = await SecureStore.getItemAsync("authToken");

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
          timeout: 5000,
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
              onPress: () => handleLogoutAccount(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Logout Error:", error);

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

  const showLogoutConfirmation = () => {
    setShowLogoutOptions(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={showLogoutConfirmation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            {iconOnly ? (
              <Feather name="log-out" size={20} color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Feather name="log-out" size={16} color="#fff" style={styles.icon} />
                <Text style={styles.buttonText}>Keluar</Text>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Modal untuk pilihan logout */}
      <Modal
        visible={showLogoutOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pilihan Keluar</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={logoutToMenu}
            >
              <Feather name="home" size={20} color="#2a7f62" />
              <Text style={styles.optionText}>Keluar ke Menu Utama</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLogoutAccount}
            >
              <Feather name="log-out" size={20} color="#e74c3c" />
              <Text style={styles.optionText}>Keluar dari Akun</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLogoutOptions(false)}
            >
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#cccccc",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  icon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LogoutButton;
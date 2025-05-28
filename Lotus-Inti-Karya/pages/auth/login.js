import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  BackHandler,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MyTextInput from "../../components/InputField";
import Button from "../../components/Button";
import COLORS from "../../constants/colors";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from "../../constants/constants";

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
        navigation.navigate('MainMenu'); // Changed from 'Main' to 'MainMenu'
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Semua Kolom Wajib Diisi!");
      return;
    }
    try {
      const response = await axios.post((`${API_BASE_URL}/api/login_user/`), {
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

        Alert.alert("Sukses", "Berhasil Masuk");
        setPassword("");
        setUsername("");
        navigation.navigate("MainMenu"); // Changed from 'Main' to 'MainMenu'
      } else {
        Alert.alert("Error", "Akun Tidak Terdaftar");
      }
    } catch (error) {
      if (error.response) {
        console.log("Server responded with status code:", error.response.status);
        if (error.response.status === 401) {
          Alert.alert("Error", "Username atau Password Salah");
        } else {
          Alert.alert("Error", "Ada masalah dengan server");
        }
      } else if (error.request) {
        console.log("Request was made but no response received");
        Alert.alert("Error", "Tidak ada respons dari server");
      } else {
        console.log("Error while making the request:", error.message);
        Alert.alert("Error", "Terjadi error");
      }
    }
  };

  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={styles.content}>
        {/* Header with logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/liklogo-2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Silahkan Login</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MyTextInput
              label="Username"
              icon="user"
              placeholder="Masukkan Nama"
              value={username}
              onChangeText={setUsername}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <MyTextInput
              label="Password"
              icon="lock"
              placeholder="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              containerStyle={styles.input}
            />
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            filled
            style={styles.loginButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginButton: {
    marginTop: 24,
    borderRadius: 8,
    height: 48,
  },
});

export default Login;
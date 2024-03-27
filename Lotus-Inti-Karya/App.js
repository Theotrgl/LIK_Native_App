import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import Form from './pages/main';
import Register from './pages/register';
import Login from './pages/login';

export default function App() {
  return (
    // <Register/>
    // <Form/>
    <Login />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10
  }
});

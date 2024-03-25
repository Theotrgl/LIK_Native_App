import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView,  Platform } from 'react-native';
import Form from './pages/main';

export default function App() {
  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <Form/>
    </SafeAreaView>
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

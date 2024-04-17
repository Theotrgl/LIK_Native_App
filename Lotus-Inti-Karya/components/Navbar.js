import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import LogoutButton from "./LogoutButton"; // Assuming LogoutButton component is in the same directory

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      {/* Left Section (Title) */}
      <Image source={require("../assets/liklogo-2.png")} style={styles.logo} />

      {/* Right Section (Logout Button) */}
      <View style={styles.logoutButtonContainer}>
        <LogoutButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButtonContainer: {
    marginLeft: 5, // Pushes the container to the right end
  },
  logo: {
    width: 60, // Adjust the width and height as needed
    height: 40,
    marginRight: 10,
    resizeMode: "contain",
  },
});

export default Navbar;

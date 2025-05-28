import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import API from "../constants/service";
import { Feather } from "@expo/vector-icons";

const Navbar = ({
  showLogo = true,
  logoSource = require("../assets/liklogo-2.png"),
  leftContent = null,
  rightContent = null,
  style,
  color = "#2a7f62", // Default green color
}) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await API.getUserInfo();
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <View style={[styles.navbar, { backgroundColor: color }, style]}>
      <View style={styles.leftSection}>
        {showLogo && (
          <TouchableOpacity style={styles.logoContainer} activeOpacity={0.7}>
            <Image source={logoSource} style={styles.logo} />
            <View style={styles.userContainer}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : error ? (
                <Text style={styles.errorText}>Error loading user</Text>
              ) : (
                userInfo && (
                  <>
                    <Text style={styles.welcomeText}>Halo,</Text>
                    <Text style={styles.userName}>
                      {userInfo.firstName} <Feather name="user" size={16} color="#fff" />
                    </Text>
                  </>
                )
              )}
            </View>
          </TouchableOpacity>
        )}
        {leftContent}
      </View>

      <View style={styles.rightSection}>
        {rightContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 50,
    height: 40,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  userContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: -2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default Navbar;
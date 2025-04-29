import React from "react";
import { View, Image, StyleSheet } from "react-native";
import COLORS from "../constants/colors";

const Navbar = ({
  showLogo = true,
  logoSource = require("../assets/liklogo-2.png"),
  leftContent = null,
  rightContent = null,
  style,
}) => {
  return (
    <View style={[styles.navbar, style]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {leftContent ? (
          leftContent
        ) : showLogo ? (
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : null}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>{rightContent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.lightGray,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  logo: {
    width: 60,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
});

export default Navbar;

import { Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import COLORS from "../constants/colors";
import { Feather } from "@expo/vector-icons";

const Button = (props) => {
  const filledBgColor = props.color || COLORS.primary;
  const outlinedColor = COLORS.white;
  const bgColor = props.filled ? filledBgColor : outlinedColor;
  const textColor = props.filled ? COLORS.white : COLORS.primary;
  const borderColor = props.borderColor || COLORS.primary;

  return (
    <TouchableOpacity
      style={{
        ...styles.button,
        ...{ backgroundColor: bgColor },
        ...{ borderColor: borderColor },
        ...props.style,
      }}
      onPress={props.onPress}
    >
      {props.icon && (
        <Feather name={props.icon} size={24} color={textColor} style={styles.icon} />
      )}
      <Text style={{ fontSize: 18, ...{ color: textColor } }}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingBottom: 16,
    paddingVertical: 10,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { marginRight: 5 },
});
export default Button;

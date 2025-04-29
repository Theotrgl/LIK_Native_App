import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import COLORS from "../constants/colors";

const Button = ({
  title,
  onPress,
  filled = true,
  color = COLORS.primary,
  textColor,
  borderColor,
  icon,
  style,
  disabled = false,
  loading = false,
  rippleColor = COLORS.white,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}) => {
  const backgroundColor = filled ? color : COLORS.white;
  const finalTextColor = textColor ?? (filled ? COLORS.white : color);
  const finalBorderColor = borderColor ?? color;
  const buttonOpacity = disabled ? 0.6 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: finalBorderColor,
          opacity: buttonOpacity,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={hitSlop}
    >
      {loading ? (
        <ActivityIndicator color={finalTextColor} size="small" />
      ) : (
        <>
          {icon && (
            <Feather name={icon} size={20} color={finalTextColor} style={styles.icon} />
          )}
          <Text style={[styles.text, { color: finalTextColor }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;

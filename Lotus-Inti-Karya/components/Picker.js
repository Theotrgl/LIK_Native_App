import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import COLORS from "../constants/colors";

const PickerInput = ({
  label,
  data = [],
  onSelect,
  value,
  placeholder,
  displayField = "nama",
  keyExtractor = "id",
  disabled = false,
  style = {}
}) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setSelectedValue(value[keyExtractor]);
    } else {
      setSelectedValue(null);
    }
  }, [value, keyExtractor]);

  const handleValueChange = (itemValue) => {
    if (itemValue === null || disabled) {
      onSelect(null);
      return;
    }

    const selectedItem = data.find(item => item[keyExtractor] === itemValue);
    setSelectedValue(itemValue);
    onSelect(selectedItem);
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.pickerContainer,
        {
          borderColor: isFocused ? COLORS.primary : COLORS.lightGray,
          backgroundColor: isFocused ? COLORS.lightPrimary : disabled ? COLORS.lightGray : 'white',
          opacity: disabled ? 0.7 : 1
        },
      ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleValueChange}
          style={[styles.picker, disabled && styles.disabledPicker]}
          dropdownIconColor={isFocused ? COLORS.primary : disabled ? COLORS.gray : COLORS.gray}
          mode="dropdown"
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          enabled={!disabled}
        >
          <Picker.Item
            label={placeholder || `Pilih ${label}`}
            value={null}
            color={disabled ? COLORS.gray : COLORS.gray}
          />
          {data.map((item) => (
            <Picker.Item
              key={item[keyExtractor]}
              label={item[displayField]}
              value={item[keyExtractor]}
              color={disabled ? COLORS.gray : COLORS.dark}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.dark,
  },
  pickerContainer: {
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  picker: {
    width: '100%',
    color: COLORS.dark,
  },
  disabledPicker: {
    color: COLORS.gray,
  },
});

export default PickerInput;
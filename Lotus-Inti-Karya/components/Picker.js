import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import COLORS from "../constants/colors";
import { Feather } from "@expo/vector-icons";

const PickerInput = ({ label, data, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsFocused(true)}
        style={[
          styles.container,
          { borderColor: isFocused ? COLORS.primary : "#999" },
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue, itemIndex) => {
            setIsFocused(false);
            setSelectedValue(itemValue);
            onSelect(itemValue); // Pass the selected value to the parent component
          }}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <Picker.Item key="default" label={`Pilih ${label}`} value={null} color={isFocused ? COLORS.primary : "#999"} />
          {data.map((item) => (
            <Picker.Item
              key={item.id}
              label={item.nama}
              value={item}
              color={isFocused ? COLORS.primary : "#999"}
            />
          ))}
        </Picker>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 45,
    borderWidth: 2,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 9,
    width: 300,
  },
  input: {
    flex: 1,
    width: "100%",
    height: 40,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    marginVertical: 8,
  },
});

export default PickerInput;

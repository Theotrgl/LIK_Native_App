import * as React from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../constants/colors";
import { Feather } from "@expo/vector-icons";

class MyTextInput extends React.Component {
  state = {
    isFocused: false,
  };

  handleFocus = (event) => {
    this.setState({ isFocused: true });
    // Remember to propagate the `onFocus` event to the
    // parent as well (if set)
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  handleBlur = (event) => {
    this.setState({ isFocused: false });
    // Remember to propagate the `onBlur` event to the
    // parent as well (if set)
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  render() {
    const { isFocused } = this.state;
    const { icon, label, onFocus, onBlur, ...otherProps } = this.props;

    return (
      <View>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => this.inputRef.focus()}
          style={[
            styles.container,
            { borderColor: isFocused ? COLORS.primary : "#999" },
          ]}
        >
          {icon && (
            <Feather
              name={icon}
              size={24}
              color={isFocused ? COLORS.primary : "#999"}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={(ref) => (this.inputRef = ref)}
            selectionColor={COLORS.primary}
            placeholderTextColor={isFocused ? COLORS.primary : "#999"}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            style={styles.input}
            {...otherProps}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 9,
    width: 300,
    width: "100%",
  },
  input: {
    flex: 1,
    width: "100%",
    height: 40,
    paddingHorizontal: 10,
    // borderWidth: 1,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    marginVertical: 8,
  },
});

export default MyTextInput;

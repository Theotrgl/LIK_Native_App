import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

const PickerInput = ({
  label,
  data = [],
  onSelect,
  value,
  placeholder = "Pilih opsi",
  displayField = "nama",
  keyExtractor = "id",
  disabled = false,
  loading = false,
  style = {},
  error = null,
  required = false,
  searchable = false,
}) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync with external value changes
  useEffect(() => {
    if (value && value[keyExtractor] !== undefined) {
      setSelectedValue(String(value[keyExtractor]));
    } else {
      setSelectedValue(null);
    }
  }, [value, keyExtractor]);

  const filteredData = searchable
    ? data.filter(item =>
      String(item[displayField]).toLowerCase().includes(searchQuery.toLowerCase()))
    : data;

  const handleSelectItem = useCallback((item) => {
    if (disabled || loading) return;

    const selectedItem = data.find(i =>
      String(i[keyExtractor]) === String(item[keyExtractor])
    );

    if (selectedItem) {
      setSelectedValue(item[keyExtractor]);
      onSelect(selectedItem);
    }
    setIsModalVisible(false);
    setSearchQuery("");
  }, [data, disabled, keyExtractor, loading, onSelect]);

  const clearSelection = () => {
    setSelectedValue(null);
    onSelect(null);
  };

  const getSelectedLabel = () => {
    if (!selectedValue) return placeholder;
    const selected = data.find(item =>
      String(item[keyExtractor]) === String(selectedValue)
    );
    return selected ? selected[displayField] : placeholder;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        String(item[keyExtractor]) === String(selectedValue) && styles.selectedItem
      ]}
      onPress={() => handleSelectItem(item)}
    >
      <Text style={styles.itemText}>{item[displayField]}</Text>
      {String(item[keyExtractor]) === String(selectedValue) && (
        <MaterialIcons name="check" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[
            styles.label,
            error && styles.errorText,
            disabled && styles.disabledText
          ]}>
            {label}
            {required && <Text style={styles.requiredMark}> *</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.inputContainer,
          isModalVisible && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled
        ]}
        onPress={() => !disabled && !loading && setIsModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        <Text
          style={[
            styles.inputText,
            !selectedValue && styles.placeholderText,
            disabled && styles.disabledText
          ]}
          numberOfLines={1}
        >
          {getSelectedLabel()}
        </Text>

        {selectedValue && !disabled ? (
          <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
            <MaterialIcons name="close" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        ) : (
          <MaterialIcons
            name={isModalVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={isModalVisible ? COLORS.primary : COLORS.gray}
          />
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorMessage}>{error}</Text>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label || placeholder}</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color={COLORS.gray}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={(item) => String(item[keyExtractor])}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data</Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  requiredMark: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.7,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  disabledText: {
    color: COLORS.gray,
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  errorMessage: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: COLORS.dark,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedItem: {
    backgroundColor: COLORS.lightPrimary,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default PickerInput;
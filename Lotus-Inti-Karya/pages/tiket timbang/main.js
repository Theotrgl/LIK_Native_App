import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// Components
import styles from "../../components/style";
import COLORS from "../../constants/colors";
import MyTextInput from "../../components/InputField";
import PickerInput from "../../components/Picker";
import LogoutButton from "../../components/LogoutButton";
import Navbar from "../../components/Navbar";
import ImageEditorModal from '../../components/ImageEditorModal';
import API from "../../constants/service";

// Constants
const INITIAL_FORM_STATE = {
  plat: "BG ",
  driver: "",
  PO: "",
  DO: "",
  no_tiket: "",
  berat: "",
  reject: "",
  catatan: "",
  tanggal: new Date(),
  tujuan: "",
  lokasi: null,
  kayu: null,
  image: null,
  imageURI: null
};

const DESTINATION_RULES = {
  'Hijau Lestari': {
    woodType: 'Karet HL',
    poValue: '-',
    rejectValue: '0',
    ticketRegex: /^\d{6}$/,
    ticketMaxLength: 6,
    ticketPlaceholder: "Contoh: 123456 (6 digit angka)"
  },
  'Cipta Mandala': {
    woodType: 'Log',
    poValue: '-',
    ticketRegex: /^\d{6}$/,
    ticketMaxLength: 6,
    ticketPlaceholder: "Contoh: 123456 (6 digit angka)"
  }
};

// Configure calendar locale
LocaleConfig.locales.id = {
  monthNames: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktobr", "November", "Desember"
  ],
  monthNamesShort: [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
  ],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};
LocaleConfig.defaultLocale = "id";

// Helper functions
const formatDriverName = (text) => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const FormDeliveryInput = () => {
  const navigation = useNavigation();
  const statusBarHeight = StatusBar.currentHeight || 0;

  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [options, setOptions] = useState({
    tujuanOpt: [],
    lokasiOpt: [],
    kayuOpt: []
  });
  const [uiState, setUiState] = useState({
    loading: false,
    refreshing: false,
  });
  const [imageEditorVisible, setImageEditorVisible] = useState(false);
  const [currentImageForEditing, setCurrentImageForEditing] = useState(null);

  // Form handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDriverNameChange = (text) => {
    handleChange('driver', formatDriverName(text));
  };

  const handleRefresh = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  // Destination rules application
  const applyDestinationRules = useCallback((destinationName) => {
    const rules = DESTINATION_RULES[destinationName] || {};
    const updates = {};

    if (rules.woodType) {
      const woodType = options.kayuOpt.find(item => item.nama === rules.woodType);
      if (woodType) updates.kayu = woodType;
    }

    if (rules.poValue !== undefined) updates.PO = rules.poValue;
    if (rules.rejectValue !== undefined) updates.reject = rules.rejectValue;

    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [options.kayuOpt]);

  const handleTujuanChange = useCallback((value) => {
    handleChange('tujuan', value);
    if (value?.nama) applyDestinationRules(value.nama);
  }, [applyDestinationRules]);

  // Validation functions
  const validateRequiredFields = () => {
    const requiredFields = [
      { field: formData.plat, name: "Plat Nomor" },
      { field: formData.driver, name: "Nama Driver" },
      { field: formData.DO, name: "Nomor DO" },
      { field: formData.no_tiket, name: "Nomor Tiket Timbang" },
      { field: formData.berat, name: "Berat Netto" },
      { field: formData.reject, name: "Reject" },
      { field: formData.tujuan?.nama, name: "Tujuan Pengiriman" },
      { field: formData.lokasi?.nama, name: "Lokasi Pemotongan" },
      { field: formData.kayu?.nama, name: "Jenis Kayu" },
      { field: formData.imageURI, name: "Foto" }
    ];

    const isPORequired = !['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama);
    if (isPORequired) {
      requiredFields.push({ field: formData.PO, name: "Nomor PO" });
    }

    const missingFields = requiredFields.filter(item => !item.field);
    if (missingFields.length > 0) {
      Alert.alert(
        "Data Tidak Lengkap",
        `Harap isi semua field yang diperlukan: ${missingFields.map(f => f.name).join(', ')}`
      );
      return false;
    }
    return true;
  };

  const validateFormats = () => {
    const destinationName = formData.tujuan?.nama;
    const rules = DESTINATION_RULES[destinationName] || {};

    if (rules.ticketRegex && !rules.ticketRegex.test(formData.no_tiket)) {
      const errorMessage = rules.ticketPlaceholder
        ? "Nomor Tiket Timbang harus 6 digit angka (contoh: 123456)"
        : `Format Nomor Tiket Timbang tidak valid untuk tujuan ${destinationName}`;
      Alert.alert("Format Tiket Salah", errorMessage);
      return false;
    }

    if (!/^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/i.test(formData.plat)) {
      Alert.alert("Format Plat Salah", "Contoh format plat yang benar: BG 1234 XY");
      return false;
    }

    if (!/^\d+$/.test(formData.DO) || !/^\d+$/.test(formData.berat) || !/^\d+$/.test(formData.reject)) {
      Alert.alert("Format Angka Salah", "DO, Berat, dan Reject harus berupa angka bulat");
      return false;
    }

    return true;
  };

  const validateForm = useCallback(() => {
    return validateRequiredFields() && validateFormats();
  }, [formData]);

  // Image handling
  const requestPermission = async (permissionType) => {
    const permissionMap = {
      camera: ImagePicker.requestCameraPermissionsAsync,
      gallery: ImagePicker.requestMediaLibraryPermissionsAsync
    };

    const permissionResult = await permissionMap[permissionType]();
    if (permissionResult.status !== 'granted') {
      const permissionName = permissionType === 'camera' ? 'Kamera' : 'Galeri';
      const action = permissionType === 'camera' ? 'mengambil' : 'memilih';

      Alert.alert(
        `Izin ${permissionName} Diperlukan`,
        `Izinkan akses ${permissionName.toLowerCase()} untuk ${action} foto`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    return true;
  };

  const handleImageEdit = (uri) => {
    setCurrentImageForEditing(uri);
    setImageEditorVisible(true);
  };

  const handleImageSave = async (editedImageUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        editedImageUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      handleChange('image', manipResult);
      handleChange('imageURI', manipResult.uri);
    } catch (error) {
      console.error("Error processing edited image:", error);
      Alert.alert("Error", "Gagal memproses gambar yang diedit");
    } finally {
      setImageEditorVisible(false);
    }
  };

  const handleImageSelection = async (source) => {
    try {
      const hasPermission = await requestPermission(source);
      if (!hasPermission) return;

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.7
      };

      const result = await (source === 'camera'
        ? ImagePicker.launchCameraAsync({
          ...options,
          cameraType: ImagePicker.CameraType.back
        })
        : ImagePicker.launchImageLibraryAsync(options));

      if (!result.canceled && result.assets?.[0]) {
        handleImageEdit(result.assets[0].uri);
      }
    } catch (error) {
      console.error(`${source} error:`, error);
      Alert.alert("Error", `Gagal ${source === 'camera' ? 'mengambil' : 'memilih'} foto`);
    }
  };

  // Data fetching
  const fetchInitialData = useCallback(async () => {
    if (await API.checkToken(navigation)) {
      try {
        const options = await API.fetchOptions();
        setOptions(options);
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
      }
    }
    setUiState(prev => ({ ...prev, refreshing: false }));
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );

      return () => backHandler.remove();
    }, [fetchInitialData])
  );

  // Form submission
  const prepareSubmissionData = () => {
    const destinationName = formData.tujuan?.nama;
    const rules = DESTINATION_RULES[destinationName] || {};

    return {
      ...formData,
      kayu: rules.woodType
        ? options.kayuOpt.find(item => item.nama === rules.woodType)
        : formData.kayu,
      reject: rules.rejectValue !== undefined ? rules.rejectValue : formData.reject,
      PO: rules.poValue !== undefined ? rules.poValue : formData.PO
    };
  };

  const handleSubmit = useCallback(async () => {
    if (!(await API.checkToken(navigation)) || !validateForm()) return;

    setUiState(prev => ({ ...prev, loading: true }));

    try {
      const submissionData = prepareSubmissionData();
      const response = await API.submitFormData(submissionData);

      if (response.success) {
        Alert.alert(
          "Sukses",
          `${response.message}\n\nDetail Pengiriman:\n` +
          `- Plat: ${response.submissionData.plat}\n` +
          `- Driver: ${response.submissionData.driver}\n` +
          `- Tiket: ${response.submissionData.no_tiket}\n` +
          `- Berat: ${response.submissionData.berat} kg\n` +
          `- Tujuan: ${response.submissionData.tujuan}\n` +
          `- Lokasi: ${response.submissionData.lokasi}\n` +
          `- Tanggal: ${response.submissionData.tanggal}\n`,
          [{
            text: "OK",
            onPress: handleRefresh
          }]
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error.message || "Terjadi kesalahan. Silakan coba lagi.",
        [
          { text: "OK", onPress: () => setUiState(prev => ({ ...prev, loading: false })) },
          { text: "Coba Lagi", onPress: () => handleSubmit() }
        ]
      );
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [navigation, formData, validateForm, options.kayuOpt, handleRefresh]);

  // Calendar helpers
  const getDisabledDates = () => {
    const disabledDates = {};
    const minDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const maxDate = new Date();

    // Disable dates before minDate
    let currentDate = new Date(minDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const earliestDate = new Date(currentDate.getFullYear(), 0, 1);

    while (currentDate >= earliestDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      disabledDates[dateStr] = { disabled: true, disableTouchEvent: true };
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Disable dates after maxDate
    currentDate = new Date(maxDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const latestDate = new Date(currentDate.getFullYear() + 1, 11, 31);

    while (currentDate <= latestDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      disabledDates[dateStr] = { disabled: true, disableTouchEvent: true };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return disabledDates;
  };

  // Render components
  const renderImagePreview = () => (
    <View style={styles.imagePreviewContainer}>
      <Image
        source={{ uri: formData.imageURI }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.imageActions}>
        <TouchableOpacity
          style={[styles.imageButton, styles.retakeButton]}
          onPress={() => handleImageSelection('camera')}
        >
          <Feather name="camera" size={16} color="white" />
          <Text style={styles.imageButtonText}>Ambil Ulang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageButton, styles.removeButton]}
          onPress={() => {
            handleChange('image', null);
            handleChange('imageURI', null);
          }}
        >
          <Feather name="trash-2" size={16} color="white" />
          <Text style={styles.imageButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhotoSelectionButtons = () => (
    <View style={styles.photoSelectionContainer}>
      <TouchableOpacity
        style={[styles.photoSelectionButton, styles.cameraButton]}
        onPress={() => handleImageSelection('camera')}
      >
        <View style={styles.photoButtonIconContainer}>
          <Feather name="camera" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.photoSelectionButtonText}>Ambil Foto</Text>
        <Text style={styles.photoSelectionButtonSubtext}>Buka kamera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.photoSelectionButton, styles.galleryButton]}
        onPress={() => handleImageSelection('gallery')}
      >
        <View style={styles.photoButtonIconContainer}>
          <Feather name="image" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.photoSelectionButtonText}>Pilih dari Galeri</Text>
        <Text style={styles.photoSelectionButtonSubtext}>Pilih foto yang ada</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDestinationInfo = () => {
    const destinationName = formData.tujuan?.nama;
    if (!['Hijau Lestari', 'Cipta Mandala'].includes(destinationName)) return null;

    const woodType = destinationName === 'Hijau Lestari' ? 'Karet HL' : 'Log';
    return (
      <Text style={styles.infoText}>
        Jenis kayu otomatis {woodType} untuk tujuan ini
      </Text>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: statusBarHeight }]}>
      <Navbar
        title="Input Data Pengiriman"
        showBackButton={true}
        navigation={navigation}
        rightContent={<LogoutButton color="#1a73e8" />}
        color="#1a73e8"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={uiState.refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.formContainer}>
            {/* Vehicle and Destination Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Kendaraan & Tujuan</Text>

              <PickerInput
                label="Tujuan Pengiriman*"
                data={options.tujuanOpt}
                onSelect={handleTujuanChange}
                value={formData.tujuan}
                displayField="nama"
                keyExtractor="id"
                placeholder="Pilih tujuan pengiriman"
              />

              <MyTextInput
                label="Plat Nomor*"
                icon="truck"
                value={formData.plat}
                onChangeText={(text) => handleChange('plat', text.toUpperCase())}
                autoCapitalize="characters"
                placeholder="BG 1234 XY"
              />

              <MyTextInput
                label="Nama Driver*"
                icon="user"
                value={formData.driver}
                onChangeText={handleDriverNameChange}
                autoCapitalize="words"
                placeholder="Nama Supir"
              />
            </View>

            {/* Documents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dokumen</Text>

              <MyTextInput
                label={['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)
                  ? "Nomor PO"
                  : "Nomor PO*"}
                icon="file-text"
                value={formData.PO}
                onChangeText={(text) => handleChange('PO', text)}
                placeholder={
                  ['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)
                    ? "Tidak diperlukan"
                    : "YY/MM/XXXX"
                }
                keyboardType="numbers-and-punctuation"
                editable={!['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)}
                style={
                  ['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)
                    ? styles.disabledInput
                    : null
                }
              />

              <MyTextInput
                label="Nomor DO*"
                icon="file-text"
                value={formData.DO}
                onChangeText={(text) => handleChange('DO', text)}
                placeholder="No. DO"
                keyboardType="default"
              />

              <MyTextInput
                label="Nomor Tiket Timbang*"
                icon="file-text"
                value={formData.no_tiket}
                onChangeText={(text) => {
                  if (['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)) {
                    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    handleChange('no_tiket', cleanedText);
                  } else {
                    handleChange('no_tiket', text);
                  }
                }}
                placeholder={
                  DESTINATION_RULES[formData.tujuan?.nama]?.ticketPlaceholder || "No. Tiket Timbang"
                }
                keyboardType="default"
                maxLength={
                  DESTINATION_RULES[formData.tujuan?.nama]?.ticketMaxLength || undefined
                }
              />
            </View>

            {/* Measurements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pengukuran</Text>

              <MyTextInput
                label="Berat Netto (Kg)*"
                icon="circle"
                value={formData.berat}
                onChangeText={(text) => handleChange('berat', text)}
                keyboardType="numeric"
                placeholder="1000"
              />

              <MyTextInput
                label="Reject (Kg)*"
                icon="slash"
                value={formData.reject}
                onChangeText={(text) => handleChange('reject', text)}
                keyboardType="numeric"
                placeholder="1000"
                editable={formData.tujuan?.nama !== 'Hijau Lestari'}
                style={
                  formData.tujuan?.nama === 'Hijau Lestari'
                    ? styles.disabledInput
                    : null
                }
              />
            </View>

            {/* Wood Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Kayu</Text>
              <PickerInput
                label="Jenis Kayu*"
                data={options.kayuOpt}
                onSelect={(value) => handleChange('kayu', value)}
                value={formData.kayu}
                displayField="nama"
                keyExtractor="id"
                placeholder="Pilih jenis kayu"
                disabled={['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)}
                style={
                  ['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)
                    ? styles.disabledInput
                    : null
                }
              />
              {renderDestinationInfo()}

              <PickerInput
                label="Lokasi Pemotongan*"
                data={options.lokasiOpt}
                onSelect={(value) => handleChange('lokasi', value)}
                value={formData.lokasi}
                displayField="nama"
                keyExtractor="id"
                placeholder="Pilih lokasi pemotongan"
              />
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
              <MyTextInput
                label="Catatan (Opsional)"
                icon="edit-3"
                value={formData.catatan}
                onChangeText={(text) => handleChange('catatan', text)}
                multiline={true}
                numberOfLines={4}
                placeholder="Nama Tukang Potong/Info Lain"
                inputStyle={styles.notesInput}
                containerStyle={styles.notesContainer}
              />
            </View>

            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tanggal Keluar*</Text>
              <Calendar
                current={formData.tanggal.toISOString().split("T")[0]}
                onDayPress={(day) => {
                  const selectedDate = new Date(day.timestamp);
                  const minDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  const maxDate = new Date();

                  if (selectedDate >= minDate && selectedDate <= maxDate) {
                    handleChange('tanggal', selectedDate);
                  }
                }}
                markedDates={{
                  ...getDisabledDates(),
                  [formData.tanggal.toISOString().slice(0, 10)]: {
                    selected: true,
                    selectedColor: COLORS.primary,
                  },
                }}
                minDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                maxDate={new Date().toISOString().split('T')[0]}
                disableAllTouchEventsForDisabledDays={true}
                theme={{
                  ...styles.calendarTheme,
                  textDisabledColor: '#CCCCCC',
                  disabledBackgroundColor: '#F5F5F5',
                  'stylesheet.calendar.header': {
                    ...styles.calendarTheme['stylesheet.calendar.header'],
                    dayTextAtIndex0: { color: 'red' },
                    dayTextAtIndex6: { color: 'red' },
                  },
                }}
                style={styles.calendar}
              />
            </View>

            {/* Documentation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dokumentasi*</Text>
              <Text style={styles.photoNote}>Foto bukti pengiriman (wajib)</Text>
              {formData.imageURI ? renderImagePreview() : renderPhotoSelectionButtons()}
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              {uiState.loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={uiState.loading}
                >
                  <Feather name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Kirim Data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Editor Modal */}
      <ImageEditorModal
        visible={imageEditorVisible}
        onClose={() => setImageEditorVisible(false)}
        imageUri={currentImageForEditing}
        onSave={handleImageSave}
        onError={(error) => {
          console.error("Image editor error:", error);
          Alert.alert(
            "Error",
            "Gagal mengedit gambar. Silakan coba lagi atau pilih gambar lain."
          );
        }}
        closeButtonText="Batal"
        saveButtonText="Simpan Perubahan"
      />
    </SafeAreaView>
  );
};

export default FormDeliveryInput;
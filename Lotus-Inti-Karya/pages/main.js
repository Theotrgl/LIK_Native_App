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
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import styles from "../components/style.js";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import MyTextInput from "../components/InputField";
import PickerInput from "../components/Picker";
import LogoutButton from "../components/LogoutButton";
import Navbar from "../components/Navbar";
import * as ImagePicker from "expo-image-picker";
import API from "../constants/service.js";

// Configure calendar locale
LocaleConfig.locales.id = {
  monthNames: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ],
  monthNamesShort: [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
  ],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};
LocaleConfig.defaultLocale = "id";

const initialFormState = {
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

const Form = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState(initialFormState);
  const [options, setOptions] = useState({
    tujuanOpt: [],
    lokasiOpt: [],
    kayuOpt: []
  });
  const [uiState, setUiState] = useState({
    loading: false,
    refreshing: false,
    regexTiket: /.*/,
    regexPO: /.*/,
    tiketKeyboardType: 'default',
  });

  // Helper functions
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDriverNameChange = (text) => {
    const formattedText = text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    handleChange('driver', formattedText);
  };

  const handleTujuanChange = useCallback((value) => {
    handleChange('tujuan', value);

    // Auto-select and lock wood type based on destination
    if (value?.nama === 'Hijau Lestari') {
      const kayuKaret = options.kayuOpt.find(item => item.nama === 'Karet HL');
      if (kayuKaret) {
        handleChange('kayu', kayuKaret);
      }
      handleChange('PO', '-');
      handleChange('reject', '0');

      // Set validation for ticket number (6 digits)
      setUiState(prev => ({
        ...prev,
        regexTiket: /^\d{6}$/
      }));
    }
    else if (value?.nama === 'Cipta Mandala') {
      const kayuLog = options.kayuOpt.find(item => item.nama === 'Log');
      if (kayuLog) {
        handleChange('kayu', kayuLog);
      }
      handleChange('PO', '-');

      // Set validation for ticket number (6 digits)
      setUiState(prev => ({
        ...prev,
        regexTiket: /^\d{6}$/
      }));
    }
    else {
      handleChange('PO', '');
      handleChange('kayu', null);
      if (formData.tujuan?.nama === 'Hijau Lestari') {
        handleChange('reject', '');
      }

      // Reset to default validation
      setUiState(prev => ({
        ...prev,
        regexTiket: /.*/
      }));
    }
  }, [options.kayuOpt, formData.tujuan?.nama]);

  const handleRefresh = useCallback(() => {
    setFormData(initialFormState);
  }, []);

  const validateForm = useCallback(() => {
    const tujuanNama = formData.tujuan?.nama;

    const requiredFields = [
      { field: formData.plat, name: "Plat Nomor" },
      { field: formData.driver, name: "Nama Driver" },
      { field: formData.DO, name: "Nomor DO" },
      { field: formData.no_tiket, name: "Nomor Tiket Timbang" },
      { field: formData.berat, name: "Berat Netto" },
      { field: formData.reject, name: "Reject" },
      { field: tujuanNama, name: "Tujuan Pengiriman" },
      { field: formData.lokasi?.nama, name: "Lokasi Pemotongan" },
      { field: formData.kayu?.nama, name: "Jenis Kayu" },
      { field: formData.image, name: "Foto" }
    ];

    const isPORequired = !['Cipta Mandala', 'Hijau Lestari'].includes(tujuanNama);
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

    if (!uiState.regexTiket.test(formData.no_tiket)) {
      const errorMessage = ['Hijau Lestari', 'Cipta Mandala'].includes(tujuanNama)
        ? "Nomor Tiket Timbang harus 6 digit angka (contoh: 123456)"
        : `Format Nomor Tiket Timbang tidak valid untuk tujuan ${tujuanNama}`;

      Alert.alert("Format Tiket Salah", errorMessage);
      return false;
    }

    if (isPORequired && uiState.regexPO && !uiState.regexPO.test(formData.PO)) {
      Alert.alert(
        "Format PO Salah",
        `Format Nomor PO tidak valid untuk tujuan ${tujuanNama}`
      );
      return false;
    }

    const platRegex = /^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/i;
    if (!platRegex.test(formData.plat)) {
      Alert.alert(
        "Format Plat Salah",
        "Contoh format plat yang benar: BG 1234 XY"
      );
      return false;
    }

    if (!/^\d+$/.test(formData.DO) || !/^\d+$/.test(formData.berat) || !/^\d+$/.test(formData.reject)) {
      Alert.alert(
        "Format Angka Salah",
        "DO, Berat, dan Reject harus berupa angka bulat"
      );
      return false;
    }
    return true;

  }, [formData, uiState.regexTiket, uiState.regexPO]);

  const handleImageSelection = async (useCamera = false) => {
    try {
      const { status } = await (useCamera
        ? ImagePicker.requestCameraPermissionsAsync()
        : ImagePicker.requestMediaLibraryPermissionsAsync());

      if (status !== 'granted') {
        Alert.alert(
          "Izin Diperlukan",
          `Kami memerlukan izin ${useCamera ? 'kamera' : 'galeri'} untuk melanjutkan`
        );
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [3, 4],
        quality: 0.8,
        selectionLimit: 1
      };

      const result = await (useCamera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));

      if (!result.canceled && result.assets?.[0]) {
        handleChange('image', result);
        handleChange('imageURI', result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image selection error:", error);
      Alert.alert("Error", "Gagal memilih gambar. Silakan coba lagi.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        if (await API.checkToken(navigation)) {
          try {
            const options = await API.fetchOptions();
            setOptions(options);
          } catch (error) {
            Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
          }
        }
        setUiState(prev => ({ ...prev, refreshing: false }));
      };

      fetchInitialData();

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const handleSubmit = useCallback(async () => {
    if (!(await API.checkToken(navigation))) return;
    if (!validateForm()) return;

    setUiState(prev => ({ ...prev, loading: true }));

    try {
      // Prepare final data with locked values
      const submissionData = {
        ...formData,
        // Force correct wood type based on destination=
        kayu: formData.tujuan?.nama === 'Hijau Lestari'
          ? options.kayuOpt.find(item => item.nama === 'Karet HL')
          : formData.tujuan?.nama === 'Cipta Mandala'
            ? options.kayuOpt.find(item => item.nama === 'Log')
            : formData.kayu,
        // Force reject 0 for Hijau Lestari
        reject: formData.tujuan?.nama === 'Hijau Lestari' ? '0' : formData.reject,
        // Force PO to '-' for specific destinations
        PO: ['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)
          ? '-'
          : formData.PO
      };

      const response = await API.submitFormData(submissionData);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Sukses",
          "Data berhasil disimpan!",
          [{ text: "OK", onPress: handleRefresh }]
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan. Silakan coba lagi.";
      Alert.alert("Error", errorMessage);
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [navigation, formData, handleRefresh, validateForm, options.kayuOpt]);

  useEffect(() => {
    // Force select correct wood type when destination changes
    if (formData.tujuan?.nama === 'Hijau Lestari') {
      const kayuKaret = options.kayuOpt.find(item => item.nama === 'Karet HL');
      if (kayuKaret) {
        handleChange('kayu', kayuKaret);
      }
    }
    else if (formData.tujuan?.nama === 'Cipta Mandala') {
      const kayuLog = options.kayuOpt.find(item => item.nama === 'Log');
      if (kayuLog) {
        handleChange('kayu', kayuLog);
      }
    }
  }, [formData.tujuan, options.kayuOpt]);

  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: statusBarHeight }]}>
      <Navbar
        title="Input Data Pengiriman"
        showBackButton={true}
        navigation={navigation}
        rightContent={<LogoutButton />}
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
                label={
                  ['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)
                    ? "Nomor PO"
                    : "Nomor PO*"
                }
                icon="file-text"
                value={formData.PO}
                onChangeText={(text) => {
                  if (['Cipta Mandala', 'Hijau Lestari'].includes(formData.tujuan?.nama)) {
                    handleChange('PO', '-');
                  } else {
                    handleChange('PO', text);
                  }
                }}
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
                  // Untuk Hijau Lestari dan Cipta Mandala, hanya boleh angka dan max 6 digit
                  if (['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)) {
                    // Hapus semua karakter non-digit dan batasi panjang 6
                    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    handleChange('no_tiket', cleanedText);
                  } else {
                    handleChange('no_tiket', text);
                  }
                }}
                placeholder={
                  ['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)
                    ? "Contoh: 123456 (6 digit angka)"
                    : "No. Tiket Timbang"
                }
                keyboardType="default" // Selalu gunakan keyboard default
                maxLength={
                  ['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)
                    ? 6
                    : undefined
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
                onChangeText={(text) => {
                  if (formData.tujuan?.nama !== 'Hijau Lestari') {
                    handleChange('reject', text);
                  }
                }}
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
                onSelect={(value) => {
                  if (!['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama)) {
                    handleChange('kayu', value);
                  }
                }}
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
              {['Hijau Lestari', 'Cipta Mandala'].includes(formData.tujuan?.nama) && (
                <Text style={styles.infoText}>
                  Jenis kayu otomatis {formData.tujuan?.nama === 'Hijau Lestari' ? 'Karet HL' : 'Log'} untuk tujuan ini
                </Text>
              )}

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
                onDayPress={(day) => handleChange('tanggal', new Date(day.timestamp))}
                markedDates={{
                  [formData.tanggal.toISOString().slice(0, 10)]: {
                    selected: true,
                    selectedColor: COLORS.primary,
                  },
                }}
                minDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                maxDate={new Date().toISOString().split('T')[0]}
                theme={styles.calendarTheme}
                style={styles.calendar}
              />
            </View>

            {/* Documentation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dokumentasi*</Text>
              <Text style={styles.photoNote}>Foto bukti pengiriman (wajib)</Text>

              {formData.imageURI ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: formData.imageURI }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={[styles.imageButton, styles.retakeButton]}
                      onPress={() => handleImageSelection(true)}
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
              ) : (
                <View style={styles.photoButtons}>
                  <TouchableOpacity
                    style={[styles.photoButton, styles.galleryButton]}
                    onPress={() => handleImageSelection(false)}
                  >
                    <Feather name="image" size={24} color={COLORS.white} />
                    <Text style={styles.photoButtonText}>Pilih dari Galeri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoButton, styles.cameraButton]}
                    onPress={() => handleImageSelection(true)}
                  >
                    <Feather name="camera" size={24} color={COLORS.white} />
                    <Text style={styles.photoButtonText}>Ambil Foto</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    </SafeAreaView>
  );
};

export default Form;
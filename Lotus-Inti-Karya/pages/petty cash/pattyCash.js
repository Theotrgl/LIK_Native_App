import React, { useState, useCallback } from "react";
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
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Components
import styles from "../../components/style.js";
import COLORS from "../../constants/colors.js";
import MyTextInput from "../../components/InputField.js";
import PickerInput from "../../components/Picker.js";
import LogoutButton from "../../components/LogoutButton.js";
import Navbar from "../../components/Navbar.js";
import ImageEditorModal from "../../components/ImageEditorModal";
import API from "../../constants/service";

// Constants
const INITIAL_FORM_STATE = {
    detail_penggunaan: "",
    tanggal: new Date(),
    kategori: { id: null, nama: null },
    role: { id: null, nama: null },
    pegawai: { id: null, nama: null },
    uang_keluar: "",
    foto_bukti: null,
    foto_bukti_uri: null
};

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

const PattyCashForm = () => {
    const navigation = useNavigation();
    const statusBarHeight = StatusBar.currentHeight || 0;

    // State management
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [options, setOptions] = useState({
        kategoriOpt: [],
        roleOpt: [],
        pegawaiOpt: [],
    });
    const [uiState, setUiState] = useState({
        loading: false,
        refreshing: false,
        loadingOptions: false
    });
    const [errors, setErrors] = useState({
        kategori: null,
        pegawai: null,
        role: null
    });
    const [imageEditorVisible, setImageEditorVisible] = useState(false);
    const [currentImageForEditing, setCurrentImageForEditing] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    // Helper functions
    const handleChange = (field, value) => {
        if (['kategori', 'pegawai', 'role'].includes(field)) {
            setFormData(prev => ({
                ...prev,
                [field]: value ? { id: value.id, nama: value.nama } : null
            }));

            if (value) setErrors(prev => ({ ...prev, [field]: null }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleRefresh = useCallback(() => {
        setFormData({
            ...INITIAL_FORM_STATE,
            tanggal: new Date()
        });
        setErrors({
            kategori: null,
            pegawai: null,
            role: null,
        });
    }, []);

    // Role selection handler
    const handleRoleSelect = async (selectedRole) => {
        try {
            setUiState(prev => ({ ...prev, loadingOptions: true }));
            handleChange('pegawai', null);

            if (selectedRole) {
                const employees = await API.fetchPettyCashEmployeesByRole(selectedRole.id);
                setOptions(prev => ({
                    ...prev,
                    pegawaiOpt: employees
                }));
            } else {
                setOptions(prev => ({
                    ...prev,
                    pegawaiOpt: []
                }));
            }
        } catch (error) {
            console.error("Error loading employees by role:", error);
            Alert.alert("Error", "Gagal memuat data pegawai");
        } finally {
            setUiState(prev => ({ ...prev, loadingOptions: false }));
        }
    };

    // Form validation
    const validateForm = useCallback(() => {
        let isValid = true;
        const newErrors = { kategori: null, pegawai: null, role: null };

        // Validate dropdown selections
        if (!formData.kategori?.id) {
            newErrors.kategori = "Harap pilih kategori";
            isValid = false;
        }

        if (!formData.role?.id) {
            newErrors.role = "Harap pilih jabatan/role";
            isValid = false;
        }

        if (!formData.pegawai?.id) {
            newErrors.pegawai = "Harap pilih pegawai";
            isValid = false;
        }

        // Validate required fields
        const requiredFields = [
            { field: formData.detail_penggunaan, name: "Detail Penggunaan" },
            { field: formData.uang_keluar, name: "Uang Keluar" },
            { field: formData.foto_bukti, name: "Foto Bukti" }
        ];

        const missingFields = requiredFields.filter(item => !item.field);
        if (missingFields.length > 0) {
            Alert.alert(
                "Data Tidak Lengkap",
                `Harap isi semua field yang diperlukan: ${missingFields.map(f => f.name).join(', ')}`
            );
            isValid = false;
        }

        // Validate number format
        if (!/^\d+$/.test(formData.uang_keluar)) {
            Alert.alert(
                "Format Angka Salah",
                "Jumlah uang harus berupa angka bulat"
            );
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // Image handling
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

            handleChange('foto_bukti', manipResult);
            handleChange('foto_bukti_uri', manipResult.uri);
        } catch (error) {
            console.error("Error processing edited image:", error);
            Alert.alert("Error", "Gagal memproses gambar yang diedit");
        } finally {
            setImageEditorVisible(false);
        }
    };

    const requestPermission = async (type) => {
        const permissionResult = type === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== 'granted') {
            const permissionType = type === 'camera' ? "Kamera" : "Galeri";
            const action = type === 'camera' ? "mengambil" : "memilih";

            Alert.alert(
                `Izin ${permissionType} Diperlukan`,
                `Izinkan akses ${permissionType.toLowerCase()} untuk ${action} foto`,
                [
                    { text: "Batal", style: "cancel" },
                    { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }
        return true;
    };

    const handleImageSelection = async (type) => {
        try {
            const hasPermission = await requestPermission(type);
            if (!hasPermission) return;

            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.7
            };

            const result = type === 'camera'
                ? await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.back })
                : await ImagePicker.launchImageLibraryAsync(options);

            if (!result.canceled && result.assets?.[0]) {
                handleImageEdit(result.assets[0].uri);
            }
        } catch (error) {
            console.error(`${type} error:`, error);
            Alert.alert("Error", `Gagal ${type === 'camera' ? 'mengambil' : 'memilih'} foto`);
        }
    };

    // Data fetching
    const fetchOptions = async () => {
        setUiState(prev => ({ ...prev, loadingOptions: true }));

        try {
            const hasValidToken = await API.checkToken(navigation);
            if (!hasValidToken) return;

            const [kategoriOpt, roleOpt] = await Promise.all([
                API.fetchPettyCashCategories(),
                API.fetchPettyCashRole(),
            ]);

            setOptions({
                kategoriOpt: kategoriOpt || [],
                roleOpt: roleOpt || [],
                pegawaiOpt: [],
            });
        } catch (error) {
            console.error("Error fetching options:", error);
            const errorMessage = error.response?.status === 401
                ? "Sesi telah berakhir, silakan login kembali"
                : "Gagal memuat data opsi";

            Alert.alert("Error", errorMessage);
            if (error.response?.status === 401) navigation.navigate("Login");
        } finally {
            setUiState(prev => ({ ...prev, loadingOptions: false }));
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadData = async () => {
                try {
                    setUiState(prev => ({ ...prev, loadingOptions: true }));

                    if (initialLoad) {
                        const token = await SecureStore.getItemAsync("authToken");
                        if (!token) {
                            navigation.navigate("Login");
                            return;
                        }
                        setInitialLoad(false);
                    }

                    await fetchOptions();
                } catch (error) {
                    if (isActive && error.response?.status !== 401) {
                        Alert.alert(
                            "Error",
                            error.response?.data?.message || "Gagal memuat data opsi"
                        );
                    }
                } finally {
                    if (isActive) {
                        setUiState(prev => ({ ...prev, loadingOptions: false, refreshing: false }));
                    }
                }
            };

            loadData();

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => true
            );

            return () => {
                isActive = false;
                backHandler.remove();
            };
        }, [navigation, initialLoad])
    );

    // Form submission
    const handleSubmit = useCallback(async () => {
        try {
            setUiState(prev => ({ ...prev, loading: true }));

            if (!validateForm()) return;

            const response = await API.submitPettyCashReport(formData);

            Alert.alert(
                "Sukses",
                `${response.message}\n\nDetail Laporan:\n` +
                `- Kategori: ${response.submissionData.kategori}\n` +
                `- Pegawai: ${response.submissionData.pegawai}\n` +
                `- Jumlah: Rp ${response.submissionData.uang_keluar}\n` +
                `- Tanggal: ${response.submissionData.tanggal}\n`,
                [{
                    text: "OK",
                    onPress: () => {
                        setFormData({
                            ...INITIAL_FORM_STATE,
                            tanggal: new Date(),
                            kategori: formData.kategori,
                            pegawai: formData.pegawai,
                        });
                    }
                }]
            );
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
    }, [formData, validateForm, navigation]);

    // Calendar helpers
    const getDisabledDates = () => {
        const disabledDates = {};
        const minDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const maxDate = new Date();

        // Disable past dates beyond 30 days
        let currentDate = new Date(minDate);
        currentDate.setDate(currentDate.getDate() - 1);
        const earliestDate = new Date(currentDate.getFullYear(), 0, 1);

        while (currentDate >= earliestDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            disabledDates[dateStr] = { disabled: true, disableTouchEvent: true };
            currentDate.setDate(currentDate.getDate() - 1);
        }

        // Disable future dates
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
                source={{ uri: formData.foto_bukti_uri }}
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
                        handleChange('foto_bukti', null);
                        handleChange('foto_bukti_uri', null);
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

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: statusBarHeight }]}>
            <Navbar
                title="Laporan Petty Cash"
                showBackButton={true}
                navigation={navigation}
                rightContent={<LogoutButton color="#2a7f62" />}
                color="#2a7f62"
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
                        {/* Kategori Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Informasi Kategori</Text>
                            <PickerInput
                                label="Kategori*"
                                data={options.kategoriOpt}
                                loading={uiState.loadingOptions}
                                onSelect={(item) => handleChange('kategori', item)}
                                value={formData.kategori}
                                displayField="nama"
                                keyExtractor="id"
                                placeholder="Pilih Kategori"
                                error={errors.kategori}
                                required
                            />
                        </View>

                        {/* Pegawai Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Informasi Penerima</Text>
                            <PickerInput
                                label="Jabatan/Role*"
                                data={options.roleOpt}
                                loading={uiState.loadingOptions}
                                onSelect={(item) => {
                                    handleChange('role', item);
                                    handleRoleSelect(item);
                                }}
                                value={formData.role}
                                displayField="nama"
                                keyExtractor="id"
                                placeholder="Pilih Jabatan/Role"
                                error={errors.role}
                                required
                            />

                            <PickerInput
                                label="Penerima*"
                                data={options.pegawaiOpt}
                                loading={uiState.loadingOptions}
                                onSelect={(item) => handleChange('pegawai', item)}
                                value={formData.pegawai}
                                displayField="nama"
                                keyExtractor="id"
                                placeholder={!formData.role ? "Pilih Jabatan terlebih dahulu" : "Pilih Pegawai"}
                                error={errors.pegawai}
                                disabled={!formData.role}
                                required
                            />
                        </View>

                        {/* Keuangan Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Informasi Keuangan</Text>
                            <MyTextInput
                                label="Uang Keluar (Rp)*"
                                icon="dollar-sign"
                                value={formData.uang_keluar}
                                onChangeText={(text) => handleChange('uang_keluar', text)}
                                keyboardType="numeric"
                                placeholder="Masukkan jumlah uang keluar"
                            />
                        </View>

                        {/* Detail Pengeluaran Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detail Pengeluaran</Text>
                            <MyTextInput
                                label="Detail Penggunaan*"
                                icon="edit-3"
                                value={formData.detail_penggunaan}
                                onChangeText={(text) => handleChange('detail_penggunaan', text)}
                                multiline={true}
                                numberOfLines={8}
                                placeholder="Tuliskan detail penggunaan uang secara lengkap..."
                            />
                        </View>

                        {/* Tanggal Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tanggal Transaksi*</Text>
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

                        {/* Dokumentasi Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Dokumentasi*</Text>
                            <Text style={styles.photoNote}>Foto bukti pengeluaran (wajib)</Text>
                            {formData.foto_bukti_uri ? renderImagePreview() : renderPhotoSelectionButtons()}
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
                                    <Text style={styles.submitButtonText}>Kirim Laporan</Text>
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
                    Alert.alert("Error", "Gagal mengedit gambar. Silakan coba lagi atau pilih gambar lain.");
                }}
                closeButtonText="Batal"
                saveButtonText="Simpan Perubahan"
            />
        </SafeAreaView>
    );
};

export default PattyCashForm;
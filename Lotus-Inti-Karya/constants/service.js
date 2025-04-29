import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants";

const checkToken = async (navigation) => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
            navigation.navigate("Login");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Token check error:", error);
        navigation.navigate("Login");
        return false;
    }
};

const fetchOptions = async () => {
    try {
        const groupID = await SecureStore.getItemAsync("GroupID");
        if (!groupID) throw new Error("Group ID not found");

        const [tujuanRes, lokasiRes, kayuRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/group/${groupID}/tujuan/`),
            axios.get(`${API_BASE_URL}/api/group/${groupID}/lokasi/`),
            axios.get(`${API_BASE_URL}/api/group/${groupID}/kayu/`)
        ]);

        // Pastikan 'Log' dan 'Karet HL' selalu ada di opsi
        const requiredWoodTypes = [
            { id: 'default-log', nama: 'Log' },
            { id: 'default-karet', nama: 'Karet HL' }
        ];

        const existingWoodTypes = kayuRes.data || [];
        const enhancedKayuData = [
            ...requiredWoodTypes.filter(required =>
                !existingWoodTypes.some(existing => existing.nama === required.nama)
            ),
            ...existingWoodTypes
        ];

        return {
            tujuanOpt: tujuanRes.data || [],
            lokasiOpt: lokasiRes.data || [],
            kayuOpt: enhancedKayuData
        };
    } catch (error) {
        console.error("Error fetching options:", error);
        // Return default options with required wood types if API fails
        return {
            tujuanOpt: [],
            lokasiOpt: [],
            kayuOpt: [
                { id: 'default-log', nama: 'Log' },
                { id: 'default-karet', nama: 'Karet HL' }
            ]
        };
    }
};

const submitFormData = async (formData) => {
    try {
        const userID = await SecureStore.getItemAsync("User");
        if (!userID) throw new Error("User ID not found");

        const formPayload = new FormData();

        // Validasi dan penyesuaian otomatis berdasarkan tujuan
        const tujuanNama = formData.tujuan?.nama || '';
        const kayuNama = formData.kayu?.nama || '';

        // Auto-set untuk tujuan khusus
        const isHijauLestari = tujuanNama === 'Hijau Lestari';
        const isCiptaMandala = tujuanNama === 'Cipta Mandala';

        // 1. Validasi jenis kayu sesuai tujuan
        if (isHijauLestari && kayuNama !== 'Karet HL') {
            throw new Error("Jenis kayu harus 'Karet HL' untuk tujuan Hijau Lestari");
        }
        if (isCiptaMandala && kayuNama !== 'Log') {
            throw new Error("Jenis kayu harus 'Log' untuk tujuan Cipta Mandala");
        }

        // 2. Auto-set PO dan reject
        const poValue = isHijauLestari || isCiptaMandala ? '-' : formData.PO;
        const rejectValue = isHijauLestari ? '0' : formData.reject;

        // 3. Validasi format plat nomor
        const platRegex = /^[A-Z]{1,2}\s{1}\d{1,4}\s{1}[A-Z]{1,3}$/i;
        if (!platRegex.test(formData.plat)) {
            throw new Error("Format plat nomor tidak valid. Contoh: BG 1234 XY");
        }

        const payloadData = {
            plat: formData.plat,
            driver: formData.driver,
            DO: formData.DO,
            no_tiket: formData.no_tiket,
            berat: formData.berat,
            tanggal: formData.tanggal.toISOString().slice(0, 10),
            reject: rejectValue,
            lokasi: formData.lokasi?.nama || '',
            tujuan: tujuanNama,
            kayu: kayuNama,
            date_time: new Date().toISOString(),
            sender: userID,
            PO: poValue,
            catatan: formData.catatan || ''
        };

        // Tambahkan data ke FormData
        Object.entries(payloadData).forEach(([key, value]) => {
            formPayload.append(key, value);
        });

        // Handle image upload
        if (formData.image?.assets?.[0]) {
            formPayload.append("foto", {
                uri: formData.image.assets[0].uri,
                type: formData.image.assets[0].mimeType || 'image/jpeg',
                name: formData.image.assets[0].fileName || `photo_${Date.now()}.jpg`,
            });
        }

        const response = await axios.post(
            `${API_BASE_URL}/api/add_report_mobile/`,
            formPayload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${await SecureStore.getItemAsync("authToken")}`
                },
                timeout: 30000 // 30 detik timeout
            }
        );

        // Validasi response
        if (!response.data || response.status < 200 || response.status >= 300) {
            throw new Error("Invalid server response");
        }

        return response;

    } catch (error) {
        console.error("Submission error:", error);

        let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
        if (error.response) {
            errorMessage = error.response.data?.message ||
                error.response.data?.detail ||
                JSON.stringify(error.response.data);
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export default {
    checkToken,
    fetchOptions,
    submitFormData
};
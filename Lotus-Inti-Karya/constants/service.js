import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/constants";

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

const getUserInfo = async () => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/api/info_user`, {
            headers: {
                "Authorization": `Token ${token}`,
                "User-Agent": "LIK App/1.1.0",
                "Accept": "application/json"
            }
        });

        return {
            firstName: response.data.first_name || "User"
        };
    } catch (error) {
        console.error("Full error details:", {
            config: error.config,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
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
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const userID = await SecureStore.getItemAsync("User");
        if (!userID) throw new Error("User ID not found");

        // Validate image exists
        if (!formData.imageURI) {
            throw new Error("Foto bukti harus diupload");
        }

        const formPayload = new FormData();

        // Prepare payload data
        const payloadData = {
            plat: formData.plat,
            driver: formData.driver,
            DO: formData.DO,
            no_tiket: formData.no_tiket,
            berat: formData.berat,
            tanggal: formData.tanggal.toISOString().slice(0, 10),
            reject: formData.reject,
            lokasi: formData.lokasi?.nama || '',
            tujuan: formData.tujuan?.nama || '',
            kayu: formData.kayu?.nama || '',
            date_time: new Date().toISOString(),
            sender: userID,
            PO: formData.PO,
            catatan: formData.catatan || ''
        };

        // Append all fields to FormData
        Object.entries(payloadData).forEach(([key, value]) => {
            formPayload.append(key, value);
        });

        // Handle image upload
        const filename = formData.imageURI.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formPayload.append("foto", {
            uri: formData.imageURI,
            name: filename || `photo_${Date.now()}.jpg`,
            type: type
        });

        const response = await axios.post(
            `${API_BASE_URL}/api/add_report_mobile/`,
            formPayload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Token ${token}`
                },
                timeout: 30000
            }
        );

        if (!response.data || response.status < 200 || response.status >= 300) {
            throw new Error("Invalid server response");
        }

        // Return success data including submission details
        return {
            success: true,
            message: "Data berhasil disimpan!",
            submissionData: {
                plat: formData.plat,
                driver: formData.driver,
                no_tiket: formData.no_tiket,
                berat: formData.berat,
                tanggal: payloadData.tanggal,
                lokasi: payloadData.lokasi,
                tujuan: payloadData.tujuan,
                timestamp: new Date().toLocaleString()
            },
            serverResponse: response.data
        };

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
// New function to fetch petty cash categories
const fetchPettyCashCategories = async () => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/api/pettycash/kategori/`, {
            headers: {
                "Authorization": `Token ${token}`,
                "Accept": "application/json"
            }
        });

        // Transform data untuk match dengan yang diharapkan komponen
        return response.data.map(item => ({
            id: item.id.toString(),
            nama: item.nama_kategori // Ubah dari nama_kategori ke nama
        }));
    } catch (error) {
        console.error("Error fetching petty cash categories:", error);
        throw error;
    }
};
const fetchPettyCashEmployeesByRole = async (roleId) => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
            `${API_BASE_URL}/api/pettycash/pegawai/role/${roleId}/`,
            {
                headers: {
                    "Authorization": `Token ${token}`,
                    "User-Agent": "LIK App/1.1.0",
                    "Accept": "application/json"
                }
            }
        );

        if (response.status !== 200) {
            throw new Error(`Server returned status ${response.status}`);
        }

        return response.data || [];
    } catch (error) {
        console.error("Error fetching employees by role:", {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

const fetchPettyCashRole = async () => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/api/pettycash/role/`, {
            headers: {
                "Authorization": `Token ${token}`,
                "Accept": "application/json"
            }
        });

        return response.data.map(item => ({
            id: item.id.toString(),
            nama: item.nama_role
        }));
    } catch (error) {
        console.error("Error fetching petty cash roles:", error);
        throw error;
    }
};

// New function to fetch petty cash employees
const fetchPettyCashEmployees = async () => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/api/pettycash/pegawai/`, {
            headers: {
                "Authorization": `Token ${token}`,
                "User-Agent": "LIK App/1.1.0",
                "Accept": "application/json"
            }
        });

        return response.data || [];
    } catch (error) {
        console.error("Error fetching petty cash employees:", error);
        throw error;
    }
};

// New function to submit petty cash report
const submitPettyCashReport = async (formData) => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        // Validate required fields
        if (!formData.kategori || !formData.kategori.id) {
            throw new Error("Kategori belum dipilih");
        }
        if (!formData.pegawai || !formData.pegawai.id) {
            throw new Error("Pegawai belum dipilih");
        }

        const formPayload = new FormData();

        // Append all required fields with proper validation
        formPayload.append('detail_penggunaan', formData.detail_penggunaan || '');
        formPayload.append('tanggal', formData.tanggal ? formData.tanggal.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        formPayload.append('kategori', formData.kategori.id);
        formPayload.append('pegawai', formData.pegawai.id);
        formPayload.append('uang_keluar', formData.uang_keluar || '0');

        // Handle image upload
        if (formData.foto_bukti && formData.foto_bukti.uri) {
            formPayload.append('foto_bukti', {
                uri: formData.foto_bukti.uri,
                type: 'image/jpeg',
                name: `bukti_${Date.now()}.jpg`
            });
        } else {
            throw new Error("Foto bukti harus diupload");
        }

        const response = await axios.post(
            `${API_BASE_URL}/api/pettycash/create/`,
            formPayload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Token ${token}`,
                    "Accept": "application/json"
                },
                timeout: 30000
            }
        );

        // Return success data with submission details
        return {
            success: true,
            message: "Laporan petty cash berhasil disimpan!",
            submissionData: {
                detail_penggunaan: formData.detail_penggunaan,
                tanggal: formData.tanggal ? formData.tanggal.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                kategori: formData.kategori.nama,
                pegawai: formData.pegawai.nama,
                uang_keluar: formData.uang_keluar,
            },
            serverResponse: response.data
        };

    } catch (error) {
        console.error("Petty cash submission error:", error);

        let errorDetails = "Terjadi kesalahan. Silakan coba lagi.";
        if (error.response) {
            if (error.response.data) {
                errorDetails = Object.entries(error.response.data)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('\n');
            }
        } else if (error.message) {
            errorDetails = error.message;
        }

        throw new Error(errorDetails);
    }
};

const checkPettyCashAccess = async () => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) throw new Error("No authentication token found");

        const [rolesRes, employeesRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/pettycash/role/`, {
                headers: { "Authorization": `Token ${token}` }
            }),
            axios.get(`${API_BASE_URL}/api/pettycash/pegawai/`, {
                headers: { "Authorization": `Token ${token}` }
            })
        ]);

        const hasRoles = rolesRes.data && rolesRes.data.length > 0;
        const hasEmployees = employeesRes.data && employeesRes.data.length > 0;

        return hasRoles && hasEmployees;
    } catch (error) {
        console.error("Error checking petty cash access:", error);
        return false;
    }
};


export default {
    checkToken,
    fetchOptions,
    submitFormData,
    getUserInfo,
    fetchPettyCashCategories,
    fetchPettyCashEmployees,
    fetchPettyCashEmployeesByRole,
    fetchPettyCashRole,
    submitPettyCashReport,
    checkPettyCashAccess
}; 
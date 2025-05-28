import { StyleSheet } from "react-native";
import COLORS from "../constants/colors";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    notesContainer: {
        minHeight: 100,
    },
    formContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 16,
    },
    calendar: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    calendarTheme: {
        calendarBackground: 'white',
        textSectionTitleColor: COLORS.gray,
        selectedDayBackgroundColor: COLORS.primary,
        selectedDayTextColor: 'white',
        todayTextColor: COLORS.primary,
        arrowColor: COLORS.primary,
        monthTextColor: COLORS.primary,
        indicatorColor: COLORS.primary,
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    photoButton: {
        flex: 1,
        height: 100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 12,
    },
    galleryButton: {
        backgroundColor: COLORS.secondary,
    },
    cameraButton: {
        backgroundColor: COLORS.success,
    },
    photoButtonText: {
        color: 'white',
        marginTop: 8,
        fontWeight: '500',
        fontSize: 14,
    },
    photoNote: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 12,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 10,
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        justifyContent: 'center',
    },
    retakeButton: {
        backgroundColor: COLORS.primary,
    },
    removeButton: {
        backgroundColor: COLORS.danger,
    },
    imageButtonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 14,
    },
    submitContainer: {
        marginTop: 8,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#a0a0a0',
        opacity: 0.7,
        elevation: 0, // Android
        shadowOpacity: 0, // iOS
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    }, imagePreviewContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.grey,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '100%',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    imageButtonText: {
        color: COLORS.white,
        marginLeft: 5,
        fontSize: 14,
    },
    retakeButton: {
        backgroundColor: COLORS.primary,
    },

    removeButton: {
        backgroundColor: COLORS.danger,
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 5,
        width: '48%',
    },
    photoButtonText: {
        color: COLORS.white,
        marginLeft: 5,
        fontSize: 14,
    },
    galleryButton: {
        backgroundColor: COLORS.primary,
    },
    cameraButton: {
        backgroundColor: COLORS.secondary,
    },
    photoNote: {
        fontSize: 12,
        color: COLORS.grey,
        marginBottom: 5,
    },
    photoSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    photoSelectionButton: {
        width: '48%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cameraButton: {
        backgroundColor: COLORS.primary,
    },
    galleryButton: {
        backgroundColor: COLORS.secondary,
    },
    photoButtonIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    photoSelectionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    photoSelectionButtonSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }


});
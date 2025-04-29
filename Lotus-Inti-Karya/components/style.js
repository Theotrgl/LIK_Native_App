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
        minHeight: 80,
        textAlignVertical: 'center',
        paddingTop: 12,
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
        dayTextColor: COLORS.dark,
        textDisabledColor: COLORS.lightGray,
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
        height: 200,
    },
    imageActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    imageButton: {
        flex: 1,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    retakeButton: {
        backgroundColor: COLORS.primary,
    },
    removeButton: {
        backgroundColor: COLORS.danger,
    },
    imageButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
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
    },
});
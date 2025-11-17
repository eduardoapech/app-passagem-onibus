import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
        overflow: "hidden",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },

    modalTitle: {
        fontSize: 18,
        fontFamily:FONTS.montserrat.semiBold,
        color: '#136F6C',
    },

    closeButton: {
        padding: 4,
    },

    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },

    modalContent: {
        maxHeight: 400,
        padding: 16,
    },

    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },

    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontFamily:FONTS.montserrat.semiBold,
        marginBottom: 8,
        color: '#333',
    },

    textInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#333',
    },

    metaItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
    },

    metaText: {
        color: '#666',
        fontSize: 16,
    },

    cancelButton: {
        flex: 1,
        marginTop: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#136F6C',
        justifyContent:"center",
        alignItems: "center",
    },

    cancelButtonText: {
        color: '#136F6C',
        fontFamily:FONTS.montserrat.semiBold,
        fontSize: 16,
    },

    radioGroup: {
        flexDirection: "row",
        gap: 12,
    },

    radioButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        alignItems: "center",
    },

    radioButtonSelected: {
        backgroundColor: '#136F6C',
        borderColor: '#136F6C',
    },

    radioText: {
        color: '#666666',
        fontFamily:FONTS.openSans.semiBold,
    },

    radioTextSelected: {
        color: '#FFFFFF',
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        overflow: "hidden",
    },

    picker: {
        width: '100%',
    },

    metaItemSelected: {
        backgroundColor: '#E6F3F3',
        borderColor: '#136F6C',
    },

    metaTextSelected: {
        color: '#136F6C',
        fontFamily:FONTS.openSans.semiBold,
    },

});
import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    saveButton: {
        flex:1,
        backgroundColor: '#136F6C',
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 15,
    },

    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: FONTS.openSans.bold,
    },
})
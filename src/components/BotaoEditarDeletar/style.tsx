import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
        gap: 8,
    },

    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 60,
        alignItems: "center",
    },

    editButton: {
        backgroundColor: '#007AFF',
    },

    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily:FONTS.openSans.semiBold,
    },

});
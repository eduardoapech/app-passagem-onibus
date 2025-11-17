import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        margin: 8,
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    title: {
        fontSize: 16,
        fontFamily:FONTS.montserrat.bold,
        textAlign: "center",
        marginBottom: 8,
        color: '#333',
    },

    totalText: {
        fontSize: 18,
        fontFamily:FONTS.openSans.semiBold,
        color: '#007AFF',
        marginBottom: 16,
    },

    loadingText: {
        marginTop: 12,
        color: '#666',
    },

    errorText: {
        color: '#D32F2F',
        textAlign: "center",
    },

    emptyText: {
        color: '#999999',
        textAlign: "center",
    },

    legend: {
        marginTop: 20,
        width: '100%',
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
    },

    legendText: {
        fontSize: 14,
        fontFamily:FONTS.openSans.semiBold,
        color: '#666666',
        flex: 1,
    },

})
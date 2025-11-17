import { StyleSheet } from "react-native";
import { FONTS } from "@/src/constants/fonts";


export const styles = StyleSheet.create({

    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.openSans.bold,
        color: '#136F6C',
        textAlign: "center",
        marginBottom: 20,
    },

    modalBody: {
        minHeight: 200,
    },

    novaCategoriaButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },

    novaCategoriaText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#136F6C',
    },

    categoriasTitle: {
        fontSize: 16,
        fontFamily: FONTS.openSans.bold,
        color: '#606062',
        marginBottom: 10,
    },
    categoriasList: {
        maxHeight: 200,
        marginBottom: 15,
    },

    categoriaItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    categoriaText: {
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#000000',
        flex: 1,
    },

    modalInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 15,
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#333333',
        marginBottom: 15,
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    modalButton: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#E8E8E8',
        minHeight: 50,
    },

    primaryButton: {
        backgroundColor: '#136F6C',
        borderColor: '#136F6C',
    },

    closeButton: {
        backgroundColor: '#F8F8F8',
        borderColor: '#E8E8E8',
    },

    modalButtonText: {
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#333333',
    },

    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
    },

});
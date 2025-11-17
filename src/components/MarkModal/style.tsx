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

    metasTitle: {
        fontSize: 16,
        fontFamily: FONTS.openSans.bold,
        color: '#606062',
        marginBottom: 10,
    },

    metasList: {
        maxHeight: 200,
        marginBottom: 15,
    },

    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    itemSelecionado: {
        backgroundColor: '#F0F8F8',
        borderLeftWidth: 3,
        borderLeftColor: '#136F6C',
    },

    metaText: {
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#000000',
        textAlignVertical: "center",
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

    closeButton: {
        backgroundColor: '#F8F8F8',
        borderColor: '#E8E8E8',
    },

    modalButtonText: {
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#333333',
    },

    semRegistrosContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },

    textoAviso: {
        textAlign: "center",
        color: '#858587',
        fontFamily: FONTS.openSans.regular,
        fontStyle: "italic",
        marginVertical: 20,
        fontSize: 14,
    },

    textoInstrucao: {
        textAlign: "center",
        color: '#606062',
        fontFamily: FONTS.openSans.regular,
        fontSize: 14,
        marginTop: 5,
    },

    metaInfo: {
        flex: 1,
        justifyContent: "center",
        minHeight: 40,
    },

    metaDetalhes: {
        fontSize: 14,
        fontFamily: FONTS.openSans.regular,
        color: '#858587',
        marginTop: 2,
    },

    nenhumaMetaButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },

    nenhumaMetaText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: FONTS.openSans.semiBold,
        color: '#858587',
    },
});
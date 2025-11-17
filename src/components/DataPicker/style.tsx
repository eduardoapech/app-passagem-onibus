import { StyleSheet } from "react-native";
import { FONTS } from "@/src/constants/fonts";

export const styles = StyleSheet.create({
    inputContainer: {
        height:75,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingTop: 20,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    label: {
        position: "absolute",
        top: 5,
        left: 12,
        color: '#606062',
        fontFamily: FONTS.openSans.bold,
        fontSize: 16,
    },

    input: {
        borderWidth: 0,
        fontSize: 14,
        padding: 0, 
        margin: 0,
        fontFamily:FONTS.openSans.semiBold,
        color:'#858587',
        flex: 1,
        textAlignVertical: "center",
        includeFontPadding: false,
    },

    iconRight: {
        marginLeft: "auto",
        marginBottom:10,
    },

    underline: {
        width:'100%',
        height: 3,
        backgroundColor: '#136F6C',
        position: "absolute",
        bottom: 10,
        left: 12,
    },

    comboboxWrapper: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
});
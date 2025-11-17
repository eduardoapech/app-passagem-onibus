import { FONTS } from "@/src/constants/fonts"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    sectionTitle: {
        color: '#858587',
        fontFamily: FONTS.openSans.bold,
        fontSize: 16,
    },

    checkboxGroup: {
        flexDirection: "row",
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 8,   
    },

    checkboxItem: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 4,
    },

    checkboxItemSelected: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    checkboxCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#136F6C',
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },

    checkboxCircleSelected: {
        backgroundColor: '#136F6C',
    },

    checkIcon: {
        display: "none",
    },

    checkIconSelected: {
        display: "flex",
    },

    checkboxText: {
        color: '#858587',
        fontFamily: FONTS.openSans.semiBold,
        fontSize: 14,
    },
});
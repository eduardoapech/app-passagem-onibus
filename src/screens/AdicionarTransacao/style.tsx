import { FONTS } from "@/src/constants/fonts"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    header: {
        justifyContent: "center",
        height: 150,
        backgroundColor: '#009490',
        paddingHorizontal: 20,
        paddingVertical: 25,    
    },
    
    titleHeader: {
        alignItems: "center",
        marginBottom: 10,
    },

    titleText: {
        fontFamily: FONTS.montserrat.bold,
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: "center",
    },

    containerForm: {
        flex: 1,
        marginTop: 30,
        marginLeft: 80,
        marginRight: 80,
    },

    form: {
        gap: 15,
    },

    botao:{
        height:70,
    },
    
});
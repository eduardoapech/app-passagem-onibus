import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems:"center",
        backgroundColor:'#009490',
        

    },
    titulo:{
        fontSize:44,
        fontFamily:FONTS.montserrat.bold,
        color:'#FFFFFF'
    },
});
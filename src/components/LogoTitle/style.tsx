import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container:{
        flexDirection:"row",
        marginTop:70,
        justifyContent:"center"
    },
    text:{
        fontFamily: FONTS.montserrat.bold,
        fontSize:32,
        marginTop:30,
        color:'#FFFFFF'
    }
});
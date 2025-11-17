import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

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

    containerOpcoes:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        gap:50,
    },

    opcoes:{
        alignItems:"center",
    },

    opcoesText:{
        color:'#136F6C',
        fontFamily:FONTS.montserrat.bold,
        fontSize:20,
    },

    quadrado: {
        width: 200,
        height: 200,
        padding:10,
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 5,
        borderColor: '#136F6C',
  },

});
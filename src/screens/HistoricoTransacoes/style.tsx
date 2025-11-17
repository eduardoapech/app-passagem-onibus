import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    header: {
        justifyContent:"center",
        height:150,
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
        textAlign:"center",
    },

    container:{
        marginTop:20,
        justifyContent: "flex-start",
        gap: 25,
        paddingHorizontal: 16,
        width: '100%',
    },

    containerCard:{
        alignItems: "center",
        paddingHorizontal: 16,
        width: '100%',
    },

    card:{
        backgroundColor:'#FFFFFF',
        width: '90%',
        maxWidth: 350,
        height:80,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },

    cardText:{
        alignItems: "center",
        width: '100%',
    },

    text:{
        textAlign: "center",
        fontFamily: FONTS.montserrat.semiBold,
        fontSize: 16,
        color: '#535652',
    },

    textValueReceita:{
        fontSize: 18,
        fontFamily:FONTS.montserrat.semiBold,
        color: '#1EB3AE',
        textAlign: "center",
    },

    textValueDespesa:{
        fontSize: 18,
        fontFamily:FONTS.montserrat.semiBold,
        color: '#CC0102',
        textAlign: "center",
    },

    textValueSaldo:{
        fontSize: 18,
        fontFamily:FONTS.montserrat.semiBold,
        color: '#136F6C',
        textAlign: "center",
    },

    transacoesHeader: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },

    transacoesTitle: {
        fontFamily: FONTS.montserrat.bold,
        fontSize: 18,
        color: '#535652',
        textAlign: "left",
    },

    periodContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
    },

    periodLabel: {
        fontFamily: FONTS.montserrat.bold,
        fontSize: 18,
        color: '#535652',
    },

    selectorsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    pickerWrapperMes: {
        width: 130,
        borderWidth: 2,
        borderColor: '#535652',
        borderRadius: 8,
        backgroundColor: '#009490',
        overflow: "hidden",
    },

    pickerWrapperAno: {
        width:110,
        borderWidth: 2,
        borderColor: '#535652',
        borderRadius: 8,
        backgroundColor: '#009490',
        overflow: "hidden",
    },

    pickerAno: {
        height: 50,
        width:120,
        color: '#000000',
        fontFamily: FONTS.openSans.semiBold,
    },

    pickerMes: {
        height: 50,
        width:130,
        color: '#000000',
        fontFamily: FONTS.openSans.semiBold,
    },

    pesquisaContainer: {
        marginHorizontal: 16,
        marginBottom: 20,
    },

    pesquisaInput: {
        backgroundColor: '#00948f2c',
        borderRadius: 8,
        padding: 12,
        color: '#000000',
        fontSize: 18,
        borderWidth: 2,
        borderColor: '#535652',
    },

    transacaoContainer:{
        margin:10,
    },

    transacoesListContainer: {
        width: '100%',
        marginTop: 10,
    },

    transacaoCard:{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        minHeight: 140,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        shadowColor: '#000',
        shadowOffset: {width: 0,height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 6,
        borderLeftColor: '#136F6C',
    },

    contentLeft:{
        flex: 1,
        marginRight: 12,
        flexShrink: 1,
    },

    contentRight:{
        alignItems: "flex-end",
        minWidth: 100,
    },

    descricao:{
        fontSize: 16,
        fontFamily: FONTS.openSans.bold,
        color: '#1A202C',
        marginBottom: 6,
        flexWrap: "wrap",
    },

    categoriaNome: {
        fontSize: 14,
        fontFamily:FONTS.openSans.semiBold,
        color: '#2D3748',
        marginBottom: 4,
    },

    metasContainer: {
        marginBottom: 6,
    },

    metaNome: {
        fontSize: 14,
        fontFamily:FONTS.openSans.semiBold,
        color: '#2D3748',
        marginBottom: 2,
        flexWrap: "wrap",
    },

    data: {
        fontFamily:FONTS.openSans.semiBold,
        fontSize: 14,
        color: '#718096',
        marginTop: 4,
    },

    valor: {
        fontSize: 18,
        fontFamily:FONTS.montserrat.semiBold,
        marginBottom: 8,
    },

    valorReceita: {
        color: '#009490',
    },

    valorDespesa: {
        color: '#CC0102',
    },

    valorNeutro: {
        color: '#2D3748',
    },

    emptyText:{
        fontFamily:FONTS.montserrat.bold,
        color: '#535652',
        textAlign:"center",
        margin:30,
    },

    customAlertOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },

    customAlertContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '80%',
        maxWidth: 320,
        shadowColor: '#000000',
        shadowOffset: {width: 0,height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.80,
        elevation: 5,
    },

    customAlertHeader: {
        padding: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    customAlertTitle: {
        fontSize: 18,
        fontFamily:FONTS.montserrat.bold,
        textAlign: "center",
        color: '#DC3545',
    },

    customAlertBody: {
        padding: 20,
        paddingVertical: 15,
    },

    customAlertMessage: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 22,
        color: '#333333',
        fontFamily:FONTS.montserrat.semiBold,
    },

    customAlertFooter: {
        padding: 20,
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    customAlertCancelButton: {
        flex: 1,
        backgroundColor: '#6C757D',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 8,
    },

    customAlertCancelText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily:FONTS.montserrat.semiBold,
    },

    customAlertConfirmButton: {
        flex: 1,
        backgroundColor: '#DC3545',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 8,
    },

    customAlertConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily:FONTS.montserrat.bold,
    },
});
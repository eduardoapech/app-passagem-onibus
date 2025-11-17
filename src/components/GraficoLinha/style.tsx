import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  title: {
    fontSize: 16,
    fontFamily:FONTS.montserrat.bold,
    marginBottom: 16,
    textAlign: "center",
    color: '#333333',
  },

  loadingText: {
    textAlign: "center",
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },

  emptyText: {
    textAlign: "center",
    color: '#666666',
    fontSize: 16,
    paddingVertical: 40,
  },

  errorText: {
    textAlign: "center",
    color: '#FF6B6B',
    fontSize: 16,
    paddingVertical: 40,
  },

  legend: {
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap:10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft:20,
  },

  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  legendText: {
    fontSize: 16,
    fontFamily:FONTS.openSans.bold,
    color: '#333',
  },

  legendValue: {
    fontSize: 1,
    color: '#666666',
  },

  table: {
    marginTop: 16,
  },

  tableTitle: {
    fontSize: 16,
    fontFamily:FONTS.montserrat.bold,
    marginBottom: 12,
    color: '#333',
    textAlign: "center",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  headerCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.montserrat.semiBold,
    color: '#FFFFFF',
    textAlign: "center",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  evenRow: {
    backgroundColor: '#fafafa',
  },

  oddRow: {
    backgroundColor: '#FFFFFF',
  },

  cellMonth: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    color: '#333333',
    textAlign: "center",
  },

  cellReceita: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    color: '#4ECDC4',
    textAlign: "center",
  },
  cellDespesa: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    color: '#FF6B6B',
    textAlign: "center",
  },

  cellSaldo: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    textAlign: "center",
  },

  totalRow: {
    flexDirection: "row",
    backgroundColor: '#2c3e50',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: 4,
  },

  totalLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.openSans.semiBold,
    color: '#FFFFFF',
    textAlign: "center",
  },

  totalReceita: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.openSans.bold,
    color: '#4ECDC4',
    textAlign: "center",
  },

  totalDespesa: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    color: '#FF6B6B',
    textAlign: "center",
  },

  totalSaldo: {
    flex: 1,
    fontSize: 12,
    fontFamily:FONTS.montserrat.semiBold,
    textAlign: "center",
  },

  saldoPositivo: {
    color: '#4ECDC4',
  },

  saldoNegativo: {
    color: '#FF6B6B',
  },

});
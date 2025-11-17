import { FONTS } from "@/src/constants/fonts";
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  header: {
    justifyContent: "center",
    height: 150,
    backgroundColor: '#1E40AF',
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

  containerCharts: {
    margin: 20,
  },

  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  placeholderText: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

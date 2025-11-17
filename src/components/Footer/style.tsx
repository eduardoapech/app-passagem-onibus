import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  footerContainer: {
    position: "relative",
  },
  
  footer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },

  topCurve: {
    backgroundColor:'#FFFFFF',
    position: "absolute",
    top: -50,
    left: '50%',
    marginLeft: -40,
    width: 100,
    height: 51,
    borderTopWidth: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderTopColor: '#E5E7EB', 
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 2,
    gap: 4,
  },

  centerTab: {
    position: "absolute",
    top: -40,
    left: '50%',
    marginLeft: -20,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  activeTab: {
    backgroundColor: '#EFF6FF',
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  centerIconContainer: {
    backgroundColor: '#1E40AF',
  },

  activeIconContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 4,
  },

  label: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  activeLabel: {
    color: '#1E40AF',
    fontWeight: '600',
  },
});

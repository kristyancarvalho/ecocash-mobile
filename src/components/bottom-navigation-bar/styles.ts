import { StyleSheet } from "react-native";

export const navigationStyles = StyleSheet.create({
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1000,
  },
  bottomNavBar: {
    backgroundColor: "#fff",
    height: 65,
    
  },
  contentWithNav: {
    paddingBottom: 70,
  }
});
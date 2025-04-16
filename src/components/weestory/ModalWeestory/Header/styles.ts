import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 20,
    marginRight: 10,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  subTitle: {
    color: "#fff",
    fontSize: 14,
  },
});

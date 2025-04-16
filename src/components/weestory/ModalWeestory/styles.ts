import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  content: {
    flex: 1,
    height: 3,
    backgroundColor: "#0B2F08",
    marginHorizontal: 2,
    overflow: "hidden",
    borderRadius: 2,
  },
  animated: {
    height: 3,
    backgroundColor: "#2CC420",
  },
  animatedEnd: {
    height: 3,
    width: "100%",
  },
});

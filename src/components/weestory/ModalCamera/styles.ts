import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: "#000",
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    bottom: 65,
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  footer: {
    justifyContent: "flex-end",
    marginHorizontal: 5,
  },
  cameraContainer: {
    height: "90%",
    borderRadius: 20,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
});

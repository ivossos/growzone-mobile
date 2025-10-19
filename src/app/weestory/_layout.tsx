import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import { Slot } from "expo-router";
//import { CameraModalProvider } from "@/context/camera-modal-context";

//import Toast from "react-native-toast-message";
import { SafeAreaView, Text, View } from "react-native";

import ModalCamera from "@/components/weestory/ModalCamera";

export default function Layout() {
  // return (
  //   <CameraModalProvider>
  //     <Slot />
  //     <StatusBar backgroundColor={colors.black[100]} style="light" />
  //     <ModalCamera />
  //     <Toast />
  //   </CameraModalProvider>
  // );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
      <Slot />
    </SafeAreaView>
  );
}

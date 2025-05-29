import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import { CameraModalProvider } from "@/context/camera-modal-context";

import Toast from "react-native-toast-message";

import ModalCamera from "@/components/weestory/ModalCamera";

export default function Layout() {
  return (
    <CameraModalProvider>
      <Slot />
      <StatusBar style="light" />
      <ModalCamera />
      <Toast />
    </CameraModalProvider>
  );
}

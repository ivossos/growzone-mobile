import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import { Slot } from "expo-router";
import { CameraModalProvider } from "@/context/camera-modal-context";

import ModalCamera from "@/components/weestory/ModalCamera";

export default function Layout() {
  return (
    <CameraModalProvider>
      <Slot />
      <StatusBar backgroundColor={colors.black[100]} style="light" />
      <ModalCamera />
    </CameraModalProvider>
  );
}

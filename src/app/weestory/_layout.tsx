import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import { Slot } from "expo-router";
import { CameraModalProvider } from "@/context/camera-modal-context";

import CameraModal from "@/components/weestory/Camera";

export default function Layout() {
  return (
    <CameraModalProvider>
      <Slot />
      <StatusBar backgroundColor={colors.black[100]} style="light" />
      <CameraModal />
    </CameraModalProvider>
  );
}

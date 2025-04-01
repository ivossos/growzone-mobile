import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import { Slot } from "expo-router";
import { BottomSheetProvider } from "@/context/bottom-sheet-context";
import { VideoPlayerProvider } from "@/context/video-player-context";

export default function Layout() {
  return (
    <BottomSheetProvider>
      <VideoPlayerProvider>
        <Slot />
        <StatusBar backgroundColor={colors.black[100]} style="light" />
      </VideoPlayerProvider>
    </BottomSheetProvider>
  );
}

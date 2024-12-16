import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import { Slot } from "expo-router";
import { BottomSheetProvider } from "@/context/bottom-sheet-context";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import ProfileCoverBottomSheet from "@/components/ui/profile-cover-bottom-sheet";

export default function Layout() {
  const profileCoverSheetRef = useRef<BottomSheet>(null);

  const closeProfileCoverBottomSheet = () => {
    profileCoverSheetRef.current?.close();
  };

  return (
    <BottomSheetProvider>
      <Slot />
      <ProfileCoverBottomSheet
        ref={profileCoverSheetRef}
        onClose={closeProfileCoverBottomSheet}
      />
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </BottomSheetProvider>
  );
}

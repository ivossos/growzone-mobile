import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { ReportReason } from "@/api/@types/models";

interface WeestoryBottomSheetProps {
  onClose: () => void;
}

const WeestoryBottomSheet = React.forwardRef<
  BottomSheet,
  WeestoryBottomSheetProps
>(({ onClose }, ref) => {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReasons, setReportReasons] = useState<ReportReason[]>([]);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isLoadingFetchReportReasons, setIsLoadingFetchReportReasons] =
    useState(false);
  const [isDecided, setIsDecided] = useState<ReportReason | null>(null);
  const snapPoints = useMemo(() => ["30%", "40%", "70%", "90%"], []);

  const { postId, isVisible, currentType, closeBottomSheet } =
    useBottomSheetContext();

  return (
    <BottomSheet
      ref={ref}
      index={3}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      // backdropComponent={renderBackdrop}
      onClose={closeBottomSheet}
    >
      <BottomSheetView>
        <Text>Teste</Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default WeestoryBottomSheet;

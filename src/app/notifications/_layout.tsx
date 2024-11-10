import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { Slot } from 'expo-router';
import { useRef } from 'react';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import ReportBottomSheet from '@/components/ui/report-bottom-sheet';
import RateProfileBottomSheet from '@/components/ui/rate-profile-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';

export default function Layout() {
  const reportSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close()
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close()
  };

  return (
    <BottomSheetProvider>
      <Slot />
      <CommentBottomSheet ref={commentSheetRef} />
      <ReportBottomSheet ref={reportSheetRef}  onClose={closeReportBottomSheet}/>
      <RateProfileBottomSheet ref={rateProfileSheetRef} onClose={rateProfileBottomSheet}/>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </BottomSheetProvider>
  )
}
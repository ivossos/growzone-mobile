import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"
import { colors } from '@/styles/colors';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import ReportBottomSheet from '@/components/ui/report-bottom-sheet';
import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import RateProfileBottomSheet from '@/components/ui/rate-profile-bottom-sheet';
import React from 'react';

export default function PostLayout() {
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
    <>
    <BottomSheetProvider>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 500, 
        }} 
      />

      <CommentBottomSheet ref={commentSheetRef} />
      <ReportBottomSheet ref={reportSheetRef}  onClose={closeReportBottomSheet}/>
      <RateProfileBottomSheet ref={rateProfileSheetRef} onClose={rateProfileBottomSheet}/>
    </BottomSheetProvider>

    <StatusBar backgroundColor={colors.black[100]} style="light" />
  </>
  );
}

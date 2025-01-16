import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { Slot } from 'expo-router';
import { useRef } from 'react';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import ReportBottomSheet from '@/components/ui/report-bottom-sheet';
import RateProfileBottomSheet from '@/components/ui/rate-profile-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import ReportCommentBottomSheet from '@/components/ui/report-comment-bottom-sheet';
import { VideoPlayerProvider } from '@/context/video-player-context';

export default function Layout() {
  const reportSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);
  const reportCommentSheetRef = useRef<BottomSheet>(null);

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close()
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close()
  };

  const closeReportCommentBottomSheet = () => {
    reportCommentSheetRef.current?.close()
  };

  return (
    <BottomSheetProvider>
      <VideoPlayerProvider>
        <Slot />
      
      <CommentBottomSheet ref={commentSheetRef} />
      <ReportBottomSheet ref={reportSheetRef}  onClose={closeReportBottomSheet}/>
      <ReportCommentBottomSheet ref={reportCommentSheetRef} onClose={closeReportCommentBottomSheet} />
      <RateProfileBottomSheet ref={rateProfileSheetRef} onClose={rateProfileBottomSheet}/>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
      </VideoPlayerProvider>
    </BottomSheetProvider>
  )
}
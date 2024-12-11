import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { Slot } from 'expo-router';
import { useRef } from 'react';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import ReportBottomSheet from '@/components/ui/report-bottom-sheet';
import RateProfileBottomSheet from '@/components/ui/rate-profile-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import ProfileBottomSheet from '@/components/ui/profile/bottom-sheet/profile-bottom-sheet';
import ReportUserBottomSheet from '@/components/ui/profile/bottom-sheet/report-user-bottom-sheet';
import BlockUserBottomSheet from '@/components/ui/profile/bottom-sheet/block-user-bottom-sheet';
import UnlockUserBottomSheet from '@/components/ui/profile/bottom-sheet/unlock-user-bottom-sheet';
import { ActivePostHomeProvider } from '@/context/active-post-home-context';
import PostBottomSheet from '@/components/ui/post/post-bottom-sheet';
import DeletePostBottomSheet from '@/components/ui/post/delete-post-bottom-sheet';

export default function Layout() {
  const reportSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);
  const profileSheetRef = useRef<BottomSheet>(null);
  const reportUserSheetRef = useRef<BottomSheet>(null);
  const blockUserSheetRef = useRef<BottomSheet>(null);
  const unlockUserSheetRef = useRef<BottomSheet>(null);
  const postSheetRef = useRef<BottomSheet>(null);
  const deletePostSheetRef = useRef<BottomSheet>(null);

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close()
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close()
  };

  const profileBottomSheet = () => {
    profileSheetRef.current?.close()
  };

  const reportUserBottomSheet = () => {
    reportUserSheetRef.current?.close()
  };

  const blockUserBottomSheet = () => {
    blockUserSheetRef.current?.close()
  };

  const unlockUserBottomSheet = () => {
    unlockUserSheetRef.current?.close()
  };

  const closePostBottomSheet = () => {
    postSheetRef.current?.close()
  };

  const closeDeletePostBottomSheet = () => {
    deletePostSheetRef.current?.close()
  };



  return (
    <BottomSheetProvider>
      <ActivePostHomeProvider>
        <Slot />
        <CommentBottomSheet ref={commentSheetRef} />
        <ReportBottomSheet ref={reportSheetRef}  onClose={closeReportBottomSheet}/>
        <RateProfileBottomSheet ref={rateProfileSheetRef} onClose={rateProfileBottomSheet}/>
        <ProfileBottomSheet ref={profileSheetRef} onClose={profileBottomSheet}/>
        <ReportUserBottomSheet ref={reportUserSheetRef} onClose={reportUserBottomSheet} />
        <BlockUserBottomSheet ref={blockUserSheetRef} onClose={blockUserBottomSheet} />
        <UnlockUserBottomSheet ref={unlockUserSheetRef} onClose={unlockUserBottomSheet} />
        <PostBottomSheet ref={postSheetRef} onClose={closePostBottomSheet} />
        <DeletePostBottomSheet ref={deletePostSheetRef} onClose={closeDeletePostBottomSheet} />
        <StatusBar backgroundColor={colors.black[100]} style="light" />
      </ActivePostHomeProvider>
    </BottomSheetProvider>
  )
}
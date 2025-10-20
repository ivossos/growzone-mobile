import { CustomOptions } from "@/@types/navigation";
import { DrawerContent } from "@/components/ui/drawer-content";
import { Drawer } from "expo-router/drawer";
import ProfileIcon from "@/assets/icons/profile.svg";
import GrowsyncIcon from "@/assets/icons/sync.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import FileIcon from "@/assets/icons/file.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useRouter, router } from "expo-router";
import { useEffect, useRef } from "react";
import Toast from 'react-native-toast-message';
import { BottomSheetProvider } from "@/context/bottom-sheet-context";
import BottomSheet from "@gorhom/bottom-sheet";
import CommentBottomSheet from "@/components/ui/comment-bottom-sheet";
import ReportBottomSheet from "@/components/ui/report-bottom-sheet";
import RateProfileBottomSheet from "@/components/ui/rate-profile-bottom-sheet";
import { colors } from "@/styles/colors";
import { StatusBar } from "expo-status-bar";
import ProfileBottomSheet from "@/components/ui/profile/bottom-sheet/profile-bottom-sheet";
import ReportUserBottomSheet from "@/components/ui/profile/bottom-sheet/report-user-bottom-sheet";
import BlockUserBottomSheet from "@/components/ui/profile/bottom-sheet/block-user-bottom-sheet";
import { BanIcon, UserRoundXIcon } from "lucide-react-native";
import UnlockUserBottomSheet from "@/components/ui/profile/bottom-sheet/unlock-user-bottom-sheet";
import { ScrollToTopProvider } from "@/context/scroll-top-context";
import { NotificationProvider } from "@/context/notification-context";
import { ActivePostHomeProvider } from "@/context/active-post-home-context";
import ReportCommentBottomSheet from "@/components/ui/report-comment-bottom-sheet";
import PostBottomSheet from "@/components/ui/post/post-bottom-sheet";
import DeletePostBottomSheet from "@/components/ui/post/delete-post-bottom-sheet";
import GlobalSearchBottomSheet from "@/components/ui/global-search-bottom-sheet";
import { VideoPlayerProvider } from "@/context/video-player-context";

import { PlayerProvider } from "@/context/player-context";

import { CreatePostProvider } from "@/context/create-post-context";
import FloatingPostProgressBar from "@/components/ui/floating-post-progress-bar";

export default function DrawerLayout() {
  const { user, signOut, isLoadingUserStorage } = useAuth();
  const hasRedirectedRef = useRef(false); // 🧪 Track if we've already checked/redirected
  const searchSheetRef = useRef<BottomSheet>(null);
  const reportSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const reportCommentSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);
  const profileSheetRef = useRef<BottomSheet>(null);
  const reportUserSheetRef = useRef<BottomSheet>(null);
  const blockUserSheetRef = useRef<BottomSheet>(null);
  const unlockUserSheetRef = useRef<BottomSheet>(null);
  const postSheetRef = useRef<BottomSheet>(null);
  const deletePostSheetRef = useRef<BottomSheet>(null);

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close();
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close();
  };

  const profileBottomSheet = () => {
    profileSheetRef.current?.close();
  };

  const reportUserBottomSheet = () => {
    reportUserSheetRef.current?.close();
  };

  const blockUserBottomSheet = () => {
    blockUserSheetRef.current?.close();
  };

  const unlockUserBottomSheet = () => {
    unlockUserSheetRef.current?.close();
  };

  const closeReportCommentBottomSheet = () => {
    reportCommentSheetRef.current?.close();
  };

  const closePostBottomSheet = () => {
    postSheetRef.current?.close();
  };

  const closeDeletePostBottomSheet = () => {
    deletePostSheetRef.current?.close();
  };

  const closeSeachBottomSheet = () => {
    searchSheetRef.current?.close();
  };

  useEffect(() => {
    if (user?.id && !isLoadingUserStorage && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      // 🧪 DEV MODE: Skip navigation guards for mock users
      if (user.id.startsWith('mock-')) {
        console.warn('⚠️ DEV MODE: Mock user - skipping navigation guards');
        return;
      }

      // Apply navigation guards for real users only
      if (!user.is_verified) {
        router.replace('/verify-user');
      } else if (!user.has_username) {
        router.replace('/set-username');
      } else if (user.has_username && (!user.category_id || user.category_id === 0)) {
        router.replace('/user-category');
      }
    }
  }, [user?.id, isLoadingUserStorage]);

  const logout = async () => {
    await signOut();
    router.replace("/welcome");
  };

  // Wait for user storage to load before redirecting
  // This prevents race conditions during login
  if (isLoadingUserStorage) {
    return null; // Show nothing while loading
  }

  if (!user?.id) {
    return <Redirect href="/welcome" />;
  }

  return (
    <CreatePostProvider>
      <NotificationProvider>
        <ActivePostHomeProvider>
          <VideoPlayerProvider>
            <PlayerProvider>
              <BottomSheetProvider>
                <ScrollToTopProvider>
                  <Drawer
                    screenOptions={{
                      headerShown: false,
                      drawerType: "front",
                      drawerPosition: "right",
                      drawerStyle: {
                        width: "100%",
                      },
                      swipeEnabled: false,
                    }}
                    drawerContent={(props) => <DrawerContent {...props} />}
                  >
                    <Drawer.Screen name="(tabs)" />

                    {/* <Drawer.Screen
                      name="growsync/index"
                      options={{
                        title: "Growsync",
                        iconName: GrowsyncIcon,
                        isDivider: true,
                        animationEnabled: true,
                      } as CustomOptions}
                    /> */}

                    <Drawer.Screen
                      name="edit-profile"
                      options={
                        {
                          title: "Dados gerais",
                          iconName: ProfileIcon,
                          isDivider: true,
                          animationEnabled: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      name="security"
                      options={
                        {
                          title: "Segurança",
                          iconName: PadlockIcon,
                          isDivider: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      name="terms-conditions"
                      options={
                        {
                          title: "Termos e condições",
                          iconName: FileIcon,
                          isDivider: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      name="help"
                      options={
                        {
                          title: "Ajuda",
                          iconName: QuestionIcon,
                          isDivider: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      name="blocked-users"
                      options={
                        {
                          title: "Usuários bloqueados",
                          iconName: BanIcon,
                          isDivider: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      name="delete-account"
                      options={
                        {
                          title: "Excluir conta",
                          iconName: UserRoundXIcon,
                          isDivider: true,
                        } as CustomOptions
                      }
                    />

                    <Drawer.Screen
                      listeners={{
                        drawerItemPress: (e) => {
                          e.preventDefault();
                          logout();
                        },
                      }}
                      name="logout"
                      options={
                        {
                          title: "Encerrar sessão",
                          iconName: CloseIcon,
                        } as CustomOptions
                      }
                    />
                  </Drawer>
                  <FloatingPostProgressBar />
                  <CommentBottomSheet ref={commentSheetRef} />
                  <ReportBottomSheet
                    ref={reportSheetRef}
                    onClose={closeReportBottomSheet}
                  />
                  <GlobalSearchBottomSheet
                    ref={searchSheetRef}
                    onClose={closeSeachBottomSheet}
                  />
                  <ReportCommentBottomSheet
                    ref={reportCommentSheetRef}
                    onClose={closeReportCommentBottomSheet}
                  />
                  <RateProfileBottomSheet
                    ref={rateProfileSheetRef}
                    onClose={rateProfileBottomSheet}
                  />
                  <ProfileBottomSheet
                    ref={profileSheetRef}
                    onClose={profileBottomSheet}
                  />
                  <ReportUserBottomSheet
                    ref={reportUserSheetRef}
                    onClose={reportUserBottomSheet}
                  />
                  <BlockUserBottomSheet
                    ref={blockUserSheetRef}
                    onClose={blockUserBottomSheet}
                  />
                  <UnlockUserBottomSheet
                    ref={unlockUserSheetRef}
                    onClose={unlockUserBottomSheet}
                  />
                  <PostBottomSheet
                    ref={postSheetRef}
                    onClose={closePostBottomSheet}
                  />
                  <DeletePostBottomSheet
                    ref={deletePostSheetRef}
                    onClose={closeDeletePostBottomSheet}
                  />
                  <StatusBar
                    backgroundColor={colors.black[100]}
                    style="light"
                  />
                  <Toast />
                </ScrollToTopProvider>
              </BottomSheetProvider>
            </PlayerProvider>
          </VideoPlayerProvider>
        </ActivePostHomeProvider>
      </NotificationProvider>
    </CreatePostProvider>
  );
}

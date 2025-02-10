import { CustomOptions } from "@/@types/navigation";
import { DrawerContent } from "@/components/ui/drawer-content";
import { Drawer } from "expo-router/drawer";
import ProfileIcon from "@/assets/icons/profile.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import FileIcon from "@/assets/icons/file.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
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
import { CreatePostProvider } from "@/context/create-post-context";
import FloatingPostProgressBar from "@/components/ui/floating-post-progress-bar";

export default function DrawerLayout() {
  const { user, signOut, isLoadingUserStorage } = useAuth();
  const router = useRouter();
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
    if (user?.id && !isLoadingUserStorage) {
      if (!user.is_verified) {
        router.replace("/verify-user");
      } else if (!user.category_id || user.category_id === 0) {
        router.replace("/user-category");
      }
    }
  }, [user, isLoadingUserStorage, router]);

  const logout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  if (!user?.id && !isLoadingUserStorage) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <CreatePostProvider>
      <NotificationProvider>
        <ActivePostHomeProvider>
          <VideoPlayerProvider>
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

                  {/* <Drawer.Screen
                  name="event"
                  options={
                    {
                      title: 'Eventos',
                      iconName: CalenderIcon,
                      isDivider: true,
                    } as CustomOptions
                  }
                /> */}

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

                  {/* <Drawer.Screen
                  name="preference-center"
                  options={
                    {
                      title: 'Central de preferências',
                      iconName: SettingsIcon,
                      isDivider: true,
                    } as CustomOptions
                  }
                /> */}

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

                  {/* <Drawer.Screen
                  name="user-category"
                  options={
                    {
                      title: 'Perfil Grower',
                      iconName: FileIcon,
                      isDivider: true,
                    } as CustomOptions
                  }
                /> */}

                  {/* <Drawer.Screen
                  name="privacy-policy"
                  options={
                    {
                      title: 'Política de privacidade',
                      iconName: SecurityIcon,
                      isDivider: true
                    } as CustomOptions
                  }
                /> */}

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
                <StatusBar backgroundColor={colors.black[100]} style="light" />
              </ScrollToTopProvider>
            </BottomSheetProvider>
          </VideoPlayerProvider>
        </ActivePostHomeProvider>
      </NotificationProvider>
    </CreatePostProvider>
  );
}

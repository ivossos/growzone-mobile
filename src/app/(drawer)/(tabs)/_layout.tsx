import { Tabs } from "expo-router";
import React, { useRef } from "react";
import icons from "@/constants/icons";
import { Image, ImageSourcePropType, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import "@/styles/global.css";
import BottomSheet from "@gorhom/bottom-sheet";
import CreateBottomSheet from "@/components/ui/create-bottom-sheet";
import CommentBottomSheet from "@/components/ui/comment-bottom-sheet";
import { BottomSheetProvider } from "@/context/bottom-sheet-context";
import ReportBottomSheet from "@/components/ui/report-bottom-sheet";
import GlobalSearchBottomSheet from "@/components/ui/global-search-bottom-sheet";
import { useScrollToTop } from "@/context/scroll-top-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials } from "@/lib/utils";
import RateProfileBottomSheet from "@/components/ui/rate-profile-bottom-sheet";
import ProfileBottomSheet from "@/components/ui/profile/bottom-sheet/profile-bottom-sheet";
import ReportCommentBottomSheet from "@/components/ui/report-comment-bottom-sheet";
import PostBottomSheet from "@/components/ui/post/post-bottom-sheet";
import DeletePostBottomSheet from "@/components/ui/post/delete-post-bottom-sheet";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { useCreatePostProgress } from "@/hooks/use-create-post-progress";

type TabIconProps = {
  icon: ImageSourcePropType;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return focused ? (
    <LinearGradient
      className="flex items-center justify-center flex-1 h-full "
      colors={[
        "#161616",
        "#161616",
        "rgba(44, 196, 32, 0)",
        "rgba(44, 196, 32, 0.08)",
      ]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      locations={[0, 0.5, 0.5, 1]}
    >
      <View className="flex items-center justify-center w-16 h-full bg-custom-gradient border-t-2 border-brand-green">
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-8 h-8 mt-1"
        />
      </View>
    </LinearGradient>
  ) : (
    <View className="flex items-center justify-center w-16 h-full flex-1 ">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-8 h-8"
      />
    </View>
  );
};

export default function TabLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchSheetRef = useRef<BottomSheet>(null);
  const reportSheetRef = useRef<BottomSheet>(null);
  const reportCommentSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const createPostSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);
  const profileSheetRef = useRef<BottomSheet>(null);
  const postSheetRef = useRef<BottomSheet>(null);
  const deletePostSheetRef = useRef<BottomSheet>(null);

  const { scrollToTop } = useScrollToTop();
  const { user } = useAuth();
  const { pauseVideo } = useVideoPlayerContext();
  const { isProcessing, toggleVibration } = useCreatePostProgress();

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const closeCreateBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handlerCreateBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(3);
    bottomSheetRef.current?.expand();
  };

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close();
  };

  const closeReportCommentBottomSheet = () => {
    reportCommentSheetRef.current?.close();
  };

  const closeSeachBottomSheet = () => {
    searchSheetRef.current?.close();
  };

  const createPostBottomSheet = () => {
    createPostSheetRef.current?.close();
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close();
  };

  const profileBottomSheet = () => {
    profileSheetRef.current?.close();
  };

  const closePostBottomSheet = () => {
    postSheetRef.current?.close();
  };

  const closeDeletePostBottomSheet = () => {
    deletePostSheetRef.current?.close();
  };

  return (
    <>
      <BottomSheetProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2CC420",
            tabBarInactiveTintColor: "#FFF",
            tabBarShowLabel: false,
            tabBarStyle: {
              height: Platform.OS === "ios" ? 72 : 66,
              backgroundColor: "#161616",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        >
          <Tabs.Screen
            name="home"
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                const state = navigation.getState();
                const isHomeFocused =
                  state?.routes[state.index]?.name === "home";

                if (isHomeFocused) {
                  e.preventDefault();
                  scrollToTop();
                } else {
                  navigation.navigate(route.name);
                }
              },
            })}
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  name={focused ? "home" : "home-outline"}
                  color={color}
                  focused={focused}
                  icon={icons.home}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Pesquisa Global",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  name={focused ? "community" : "community-outline"}
                  color={color}
                  focused={focused}
                  icon={icons.community}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                if (isProcessing) {
                  toggleVibration();
                  return;
                }
                pauseVideo();
                openBottomSheet();
              },
            }}
            options={{
              title: "Create",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  name={focused ? "create" : "create-outline"}
                  color={color}
                  focused={focused}
                  icon={icons.create}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="reels"
            options={{
              title: "Reels",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  name={focused ? "reels" : "reels-outline"}
                  color={color}
                  focused={focused}
                  icon={icons.reels}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <Avatar
                  className={`w-8 h-8 bg-black-80 ${
                    focused && "border border-brand-green"
                  }`}
                >
                  {user.image?.image && (
                    <AvatarImage
                      className="rounded-full"
                      source={{ uri: user.image?.image }}
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(user.name || user.username)}
                  </AvatarFallback>
                </Avatar>
              ),
            }}
          />
        </Tabs>
        <StatusBar backgroundColor="#000000" style="light" />
        <CreateBottomSheet
          ref={bottomSheetRef}
          onClose={closeCreateBottomSheet}
          handlerCreateBottomSheet={handlerCreateBottomSheet}
        />
        <CommentBottomSheet ref={commentSheetRef} />
        <ReportBottomSheet
          ref={reportSheetRef}
          onClose={closeReportBottomSheet}
        />
        <ReportCommentBottomSheet
          ref={reportCommentSheetRef}
          onClose={closeReportCommentBottomSheet}
        />
        <GlobalSearchBottomSheet
          ref={searchSheetRef}
          onClose={closeSeachBottomSheet}
        />
        <RateProfileBottomSheet
          ref={rateProfileSheetRef}
          onClose={rateProfileBottomSheet}
        />
        <ProfileBottomSheet
          ref={profileSheetRef}
          onClose={profileBottomSheet}
        />
        <PostBottomSheet ref={postSheetRef} onClose={closePostBottomSheet} />
        <DeletePostBottomSheet
          ref={deletePostSheetRef}
          onClose={closeDeletePostBottomSheet}
        />
      </BottomSheetProvider>
    </>
  );
}

import { Follow, UserProfile } from "@/api/@types/models";
import { createFollow, deleteFollow, isFollower } from "@/api/social/follow";
import { getProfileUser } from "@/api/social/profile/get-profile-user";
import {
  AvatarSection,
  FollowButton,
  Metrics,
  ProfileInfo,
} from "@/components/ui/profile";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { useAuth } from "@/hooks/use-auth";
import { formatDateToMonthYear } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { NavigationContainer } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { Ellipsis } from "lucide-react-native";

import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import React, {
  ElementType,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import {
  FlatList,
  FlatListProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Connection,
  HeaderConfig,
  ScrollPair,
  Visibility,
} from "@/components/ui/profile/types";
import useScrollSync from "@/hooks/use-scroll-sync";
import TabBar from "@/components/ui/profile/tab-bar";
import PostIcon from "@/assets/icons/post.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import GrowGreenIcon from "@/assets/icons/plant-green.svg";
import GrowIcon from "@/assets/icons/plant.svg";
import ConnectionPostList from "@/components/ui/profile/connection-post-list";
import ConnectionReelstList from "@/components/ui/profile/connection-reels-list";
import ConnectionGrowPostList from "@/components/ui/profile/connection-grow-post-list";
import { EditProfileButton } from "@/components/ui/profile/edit-profile-button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import Loader from "../loader";

const TAB_BAR_HEIGHT = 48;
const HEADER_HEIGHT = 0;

const OVERLAY_VISIBILITY_OFFSET = 30;

const icons = {
  posts: (focused: boolean) =>
    focused ? (
      <PostGreenIcon width={24} height={24} />
    ) : (
      <PostIcon width={24} height={24} />
    ),
  wellz: (focused: boolean) =>
    focused ? (
      <ReelsGreenIcon width={24} height={24} />
    ) : (
      <ReelsIcon width={24} height={24} />
    ),
  plantas: (focused: boolean) =>
    focused ? (
      <GrowGreenIcon width={24} height={24} />
    ) : (
      <GrowIcon width={24} height={24} />
    ),
};

const w = Dimensions.get("screen").width;

const Tab = createMaterialTopTabNavigator();

interface Props {
  userId: number;
  Header: ElementType;
}

const UserProfileScreen = ({ userId, Header }: Props) => {
  const navigation = useNavigation();
  // const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { openBottomSheet } = useBottomSheetContext();

  //_________________________________________________________________
  const { top, bottom } = useSafeAreaInsets();

  const { height: screenHeight } = useWindowDimensions();

  const postRef = useRef<FlatList>(null);
  const reelsRef = useRef<FlatList>(null);
  const growPostsRef = useRef<FlatList>(null);

  const [tabIndex, setTabIndex] = useState(0);

  const [headerHeight, setHeaderHeight] = useState(0);

  const defaultHeaderHeight = HEADER_HEIGHT;

  const headerConfig = useMemo<HeaderConfig>(
    () => ({
      heightCollapsed: defaultHeaderHeight,
      heightExpanded: headerHeight,
    }),
    [defaultHeaderHeight, headerHeight]
  );

  const { heightCollapsed, heightExpanded } = headerConfig;

  const headerDiff = heightExpanded - heightCollapsed;

  const rendered = headerHeight > 0;

  const handleHeaderLayout = useCallback<NonNullable<ViewProps["onLayout"]>>(
    (event) => setHeaderHeight(event.nativeEvent.layout.height),
    []
  );

  const postScrollValue = useSharedValue(0);

  const postScrollHandler = useAnimatedScrollHandler(
    (event) => (postScrollValue.value = event.contentOffset.y)
  );

  const reelsScrollValue = useSharedValue(0);

  const reelsScrollHandler = useAnimatedScrollHandler(
    (event) => (reelsScrollValue.value = event.contentOffset.y)
  );

  const growPostScrollValue = useSharedValue(0);

  const growPostScrollHandler = useAnimatedScrollHandler(
    (event) => (growPostScrollValue.value = event.contentOffset.y)
  );

  const scrollPairs = useMemo<ScrollPair[]>(
    () => [
      { list: postRef, position: postScrollValue },
      { list: reelsRef, position: reelsScrollValue },
      { list: growPostsRef, position: growPostScrollValue },
    ],
    [
      postRef,
      postScrollValue,
      reelsRef,
      reelsScrollValue,
      growPostsRef,
      growPostScrollValue,
    ]
  );

  const { sync } = useScrollSync(scrollPairs, headerConfig);

  const currentScrollValue = useDerivedValue(() => {
    if (tabIndex === 0) {
      return postScrollValue.value;
    } else if (tabIndex === 1) {
      return reelsScrollValue.value;
    } else {
      return growPostScrollValue.value;
    }
  }, [tabIndex, postScrollValue, reelsScrollValue, growPostScrollValue]);

  const translateY = useDerivedValue(() => {
    if (currentScrollValue.value <= 0) {
      return 0;
    }
    return -Math.min(currentScrollValue.value, headerDiff);
  });
  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [-headerDiff, 0],
      [Visibility.Hidden, Visibility.Visible]
    ),
  }));

  const contentContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      paddingTop: rendered ? headerHeight + TAB_BAR_HEIGHT : 0,
      paddingBottom: bottom,
      minHeight: screenHeight + headerDiff,
    }),
    [rendered, headerHeight, bottom, screenHeight, headerDiff]
  );

  const sharedProps = useMemo<Partial<FlatListProps<Connection>>>(
    () => ({
      contentContainerStyle,
      onMomentumScrollEnd: sync,
      onScrollEndDrag: sync,
      scrollEventThrottle: 16,
      scrollIndicatorInsets: { top: heightExpanded },
    }),
    [contentContainerStyle, sync, heightExpanded]
  );

  const renderPosts = useCallback(
    () => (
      <ConnectionPostList
        ref={postRef}
        userId={userId}
        onScroll={postScrollHandler}
        {...sharedProps}
      />
    ),
    [userId, postRef, postScrollHandler, sharedProps]
  );

  const renderReels = useCallback(
    () => (
      <ConnectionReelstList
        ref={reelsRef}
        userId={userId}
        onScroll={reelsScrollHandler}
        {...sharedProps}
      />
    ),
    [reelsRef, reelsScrollHandler, sharedProps]
  );

  const renderGrowPost = useCallback(
    () => (
      <ConnectionGrowPostList
        ref={growPostsRef}
        userId={userId}
        onScroll={growPostScrollHandler}
        {...sharedProps}
      />
    ),
    [growPostScrollValue, growPostScrollHandler, sharedProps]
  );

  const tabBarStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      rendered ? styles.tabBarContainer : undefined,
      { top: rendered ? headerHeight : undefined },
      tabBarAnimatedStyle,
    ],
    [rendered, headerHeight, tabBarAnimatedStyle]
  );

  const renderTabBar = useCallback<
    (props: MaterialTopTabBarProps) => React.ReactElement
  >(
    (props) => (
      <Animated.View
        style={[tabBarStyle, { backgroundColor: colors.black[100] }]}
      >
        <TabBar onIndexChange={setTabIndex} {...props} />
      </Animated.View>
    ),
    [tabBarStyle]
  );

  const headerContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [rendered ? styles.headerContainer : undefined, headerAnimatedStyle],

    [rendered, top, headerAnimatedStyle]
  );

  const collapsedOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-headerDiff, OVERLAY_VISIBILITY_OFFSET - headerDiff, 0],
      [Visibility.Visible, Visibility.Hidden, Visibility.Hidden]
    ),
  }));

  const collapsedOverlayStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.collapsedOvarlay,
      collapsedOverlayAnimatedStyle,
      { height: heightCollapsed },
    ],
    [collapsedOverlayAnimatedStyle, heightCollapsed, top]
  );
  //_________________________________________________________________

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfileUser(userId),
    enabled: !!userId,
  });

  const {
    data: follow,
    isLoading: isLoadingFollow,
    error: errorFoller,
  } = useQuery({
    queryKey: ["follow", userId],
    queryFn: () => isFollower(userId),
    enabled: !!userId,
  });

  if (error || errorFoller) {
    console.error("erro on get user ", error || errorFoller);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2: "Erro ao carregar perfil. Tente novamente mais tarde.",
    });
    router.push("/home");
  }

  const handleEditProfile = () => {
    router.push({ pathname: "/profile/edit" });
  };

  const handleReviewsPress = (id: number) => {
    openBottomSheet({ type: "reviews-profile", userId: id });
  };

  const handleRateProfilePress = (id: number) => {
    openBottomSheet({
      type: "profile",
      userId: id,
      callbackFn: async () =>
        queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
    });
  };

  const { mutateAsync: deleteFollowFn, isPending: isDeleteFollowLoading } =
    useMutation({
      mutationFn: deleteFollow,
      async onSuccess() {},
      async onError(error) {
        console.error("erro on delete Follow", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro ao realizar essa ação. Tente novamente mais tarde.",
        });
      },
    });
  const { mutateAsync: createFollowFn, isPending: isCreateFollowLoading } =
    useMutation({
      mutationFn: createFollow,
      async onSuccess() {},
      async onError(error) {
        console.error("erro on create Follow", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro ao realizar essa ação. Tente novamente mais tarde.",
        });
      },
    });

  const handleFollowAction = async (isFollowing: boolean, id: number) => {
    try {
      if (isFollowing) {
        await deleteFollowFn(id);
      } else {
        await createFollowFn(id);
      }

      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["follow", userId] });
    } catch (error) {
      console.error("Erro na ação de follow", error);
    }
  };

  if (isLoadingProfile || !profile) {
    return <Loader isLoading />;
  }

  const { cover, image, info, metric } = profile;

  return (
    <View style={styles.container}>
      {/* <View style={styles.fixedHeader}>
      <Header onBack={() => router.back()} />
    </View> */}

      <Animated.View
        onLayout={handleHeaderLayout}
        style={[headerContainerStyle]}
      >
        <Header />
        <AvatarSection
          imageUri={image?.image}
          coverUri={cover?.cover}
          name={info?.name || info?.username}
          isLoggerUser={user?.id === userId}
          onEditProfile={handleEditProfile}
        />
        <ProfileInfo
          name={info?.name}
          username={info?.username}
          biography={info?.biography}
          category={info?.category}
        />
        {metric && (
          <Metrics
            userId={info.id}
            followers={metric?.followers}
            following={metric?.following}
            memberSince={formatDateToMonthYear(info?.created_at)}
            socialCount={metric?.social_count}
            reelCount={metric?.reel_count}
            averageReview={metric?.average_review}
            onReviewsPress={() => handleReviewsPress(profile.info.id)}
          />
        )}
        {user && user.id != userId && (
          <View className="flex flex-row gap-2 px-6 mt-6">
            <FollowButton
              isFollowing={!!follow}
              isLoading={
                isLoadingFollow ||
                isCreateFollowLoading ||
                isDeleteFollowLoading
              }
              onFollowPress={() =>
                handleFollowAction(!!follow?.is_active, profile.info.id)
              }
            />
            <TouchableOpacity
              onPress={() => handleRateProfilePress(profile.info.id)}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.black[70],
                borderRadius: 100,
                padding: 4,
                height: 40,
                width: 40,
              }}
            >
              <Ellipsis size={16} color={colors.black[70]} />
            </TouchableOpacity>
          </View>
        )}
        {user && user.id == userId && (
          <View className="flex flex-row flex-1 px-6 mt-6 w-full">
            <EditProfileButton />
          </View>
        )}
      </Animated.View>
      {/* {info && <Animated.View style={collapsedOverlayStyle}>
        <HeaderOverlay name={info.name || info.username}  imageUri={image?.image} onBack={() => navigation.goBack()} />
      </Animated.View>} */}
      {profile && (
        <NavigationContainer independent={true}>
          <Tab.Navigator
            tabBar={renderTabBar}
            style={{ backgroundColor: colors.black[100] }}
            screenOptions={({ route }) => ({
              tabBarContentContainerStyle: {
                justifyContent: "center",
                alignItems: "center",
              },
              tabBarIndicatorContainerStyle: {
                backgroundColor: colors.black[100],
              },
              tabBarIndicatorStyle: {
                backgroundColor: colors.brand.green,
                height: 2.5,
                // borderBottomColor: colors.black[100], borderBottomWidth: 1
              },
              tabBarIcon: ({ focused }) => {
                return icons[route.name](focused);
              },
              tabBarIconStyle: {
                width: w / 3,
                justifyContent: "center",
                alignItems: "center",
              },
              tabBarShowLabel: false,
            })}
          >
            <Tab.Screen name="posts">{renderPosts}</Tab.Screen>
            <Tab.Screen name="wellz">{renderReels}</Tab.Screen>
            <Tab.Screen name="plantas">{renderGrowPost}</Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100],
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 50,
    backgroundColor: colors.black[100],
  },
  overlayName: {
    fontSize: 24,
  },
  collapsedOvarlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.black[100],
    justifyContent: "center",
    zIndex: 1,
  },
  headerContainer: {
    top: 0,
    left: 0,
    right: 0,
    position: "absolute",
    zIndex: 1,
    backgroundColor: colors.black[100],
  },
  tabBarContainer: {
    top: 0,
    left: 0,
    right: 0,
    position: "absolute",
    zIndex: 1,
    backgroundColor: colors.black[100],
  },
});

export default memo(UserProfileScreen);

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
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";

import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import React, {
  ElementType,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderConfig, ItemData, TabData } from "@/components/ui/profile/types";
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
import {
  MasonryFlashList,
  MasonryListRenderItemInfo,
} from "@shopify/flash-list";
import { TimelineType } from "@/api/@types/enums";
import useProfile from "@/hooks/useProfile";
import { GrowPost, SocialPost } from "@/api/@types/models";

const TAB_BAR_HEIGHT = 48;
const HEADER_HEIGHT = 0;

interface Props {
  userId: number;
  Header: ElementType;
}

const UserProfileScreen = ({ userId, Header }: Props) => {
  const [activeTab, setActiveTab] = useState<TimelineType>(TimelineType.SOCIAL);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();
  const { openBottomSheet } = useBottomSheetContext();

  const data = useProfile({ userId, type: activeTab });

  const postRef = useRef<FlatList>(null);
  const reelsRef = useRef<FlatList>(null);
  const growPostsRef = useRef<FlatList>(null);

  const renderPosts = useCallback(
    (data: SocialPost, index: number) => (
      <ConnectionPostList
        ref={postRef as any}
        index={index}
        userId={userId}
        data={data}
      />
    ),
    [userId, postRef]
  );

  const renderReels = useCallback(
    (data: SocialPost, index: number) => (
      <ConnectionReelstList
        ref={reelsRef as any}
        index={index}
        userId={userId}
        data={data}
      />
    ),
    [userId, reelsRef]
  );

  const renderGrowPost = useCallback(
    (data: GrowPost, index: number) => (
      <ConnectionGrowPostList
        ref={growPostsRef as any}
        userId={userId}
        index={index}
        data={data}
      />
    ),
    [growPostsRef, userId]
  );

  const handleRefresh = useCallback(() => {
    try {
      setIsRefreshing(true);
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["follow"] });
      queryClient.removeQueries({ queryKey: ["profile-posts"] });
      queryClient.removeQueries({ queryKey: ["profile", userId] });
      queryClient.removeQueries({ queryKey: ["follow", userId] });
      queryClient.removeQueries({
        queryKey: [
          "profile-posts",
          { type: TimelineType.GROW, userId: user.id },
        ],
      });
      queryClient.removeQueries({
        queryKey: [
          "profile-posts",
          { type: TimelineType.SOCIAL, userId: user.id },
        ],
      });
      queryClient.removeQueries({
        queryKey: [
          "profile-posts",
          { type: TimelineType.WEEDZ, userId: user.id },
        ],
      });
      queryClient.removeQueries({ queryKey: ["timeline"] });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handlerChangeTab = useCallback((tabValue: TimelineType) => {
    setActiveTab(tabValue);
  }, []);

  const tabData = useMemo(() => {
    const data: TabData[] = [
      {
        isActive: activeTab === TimelineType.SOCIAL,
        icon:
          activeTab === TimelineType.SOCIAL ? (
            <PostGreenIcon width={24} height={24} />
          ) : (
            <PostIcon width={24} height={24} />
          ),
        value: TimelineType.SOCIAL,
      },
      {
        isActive: activeTab === TimelineType.WEEDZ,
        icon:
          activeTab === TimelineType.WEEDZ ? (
            <ReelsGreenIcon width={24} height={24} />
          ) : (
            <ReelsIcon width={24} height={24} />
          ),
        value: TimelineType.WEEDZ,
      },
      {
        isActive: activeTab === TimelineType.GROW,
        icon:
          activeTab === TimelineType.GROW ? (
            <GrowGreenIcon width={24} height={24} />
          ) : (
            <GrowIcon width={24} height={24} />
          ),
        value: TimelineType.GROW,
      },
    ];

    return data;
  }, [activeTab]);

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
        queryClient.removeQueries({ queryKey: ["profile", userId] }),
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

      queryClient.removeQueries({ queryKey: ["profile", userId] });
      queryClient.removeQueries({ queryKey: ["follow", userId] });
    } catch (error) {
      console.error("Erro na ação de follow", error);
    }
  };

  const renderItem = ({ item, index }: MasonryListRenderItemInfo<ItemData>) => {
    const screens = {
      [TimelineType.SOCIAL]: renderPosts,
      [TimelineType.WEEDZ]: renderReels,
      [TimelineType.GROW]: renderGrowPost,
    };

    const Component = screens[activeTab];
    return Component(item as any, index);
  };

  const getColumnFlex = useCallback(() => {
    return [TimelineType.WEEDZ, TimelineType.GROW].includes(activeTab) ? 2 : 3;
  }, [activeTab]);

  const userHeader = useMemo(() => {
    if (!profile) {
      return null;
    }

    const { info, metric, image, cover } = profile;
    return (
      <>
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
            onReviewsPress={() => handleReviewsPress(info.id)}
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
                handleFollowAction(!!follow?.is_active, info.id)
              }
            />
            <TouchableOpacity
              onPress={() => handleRateProfilePress(info.id)}
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
      </>
    );
  }, [
    profile,
    follow,
    user,
    userId,
    isLoadingFollow,
    isCreateFollowLoading,
    isDeleteFollowLoading,
  ]);

  if (isLoadingProfile || !profile) {
    return <Loader isLoading />;
  }

  return (
    <MasonryFlashList
      key={`list_${activeTab}`}
      data={data.data}
      renderItem={renderItem}
      keyExtractor={(item) => `tab_${item.id}`}
      estimatedItemSize={100}
      showsVerticalScrollIndicator={false}
      numColumns={getColumnFlex()}
      getColumnFlex={getColumnFlex}
      contentContainerStyle={{ backgroundColor: colors.black[100] }}
      onEndReached={() => data.hasNextPage && data.fetchNextPage()}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={() => {
        if (data.isLoading) {
          return <Loader isLoading />;
        }
      }}
      ListEmptyComponent={() => {
        if (!data.isLoading && data.data.length === 0) {
          return (
            <View className="flex flex-col justify-center items-center py-6">
              <Text className="text-base text-brand-grey">
                Nenhum publicação realizada
              </Text>
            </View>
          );
        }
      }}
      ListHeaderComponent={() => (
        <View className="gap-6">
          <View>{userHeader}</View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            {tabData.map((tab, index) => (
              <TouchableOpacity
                key={`item_${index}`}
                onPress={() => handlerChangeTab(tab.value)}
                style={{
                  alignItems: "center",
                  width: 100,
                  maxWidth: 100,
                  paddingVertical: 8,
                  borderBottomWidth: 3,
                  marginBottom: 10,
                  borderBottomColor: tab.isActive
                    ? colors.primary
                    : "transparent",
                }}
              >
                {tab.icon}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
};

export default memo(UserProfileScreen);

import React, {
  useState,
  Fragment,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { queryClient } from "@/lib/react-query";
import { colors } from "@/styles/colors";

import { Header } from "@/components/ui/header";
import PostCard from "@/components/ui/post-card";
import WeedzPostCard from "@/components/ui/post-weedz-card";
import GrowPostCard from "@/components/ui/grow-post-card";
import ContributorCard from "@/components/ui/contributor-card";
import Loader from "@/components/ui/loader";

import useHome from "@/hooks/useHome";
import {
  FeedAllPost,
  GrowPostDetail,
  PostDetail,
  ReelsDetail,
} from "@/api/@types/models";
import { useVideoPlayerContext } from "@/context/video-player-context";
import UpdateAppModal from "@/components/ui/update-app";
import { useScrollToTop } from "@/context/scroll-top-context";
import { useFocusEffect } from "expo-router";
import { PostType } from "@/api/@types/enums";

export default function HomeScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audioMute, setAudioMute] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);

  const {
    pauseVideo,
    toggleAudioMute,
    playVideo,
    setPlayer,
    isMuted,
    clearPlayer,
  } = useVideoPlayerContext();

  const { posts, topContributors } = useHome();
  const { setFlatListRef } = useScrollToTop();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const queryKeyValue =
      posts.data.length === 0 ? "top-contributors" : "home-posts";
    queryClient.removeQueries({ queryKey: [queryKeyValue] });
    pauseVideo();
    clearPlayer();
    setIsRefreshing(false);
  }, [posts.data]);

  const handlerAudioMute = useCallback((value: boolean) => {
    toggleAudioMute(value);
    setAudioMute(value);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedAllPost>) => {
      const componentsMap = {
        [PostType.SOCIAL_POST]: PostCard,
        [PostType.GROW_POST]: GrowPostCard,
        [PostType.WEEDZ_POST]: WeedzPostCard,
      };

      const Component: any = componentsMap[item.type];

      const commonProps = {
        post: item.post,
        audioMute,
        handlerAudioMute,
      };

      return (
        <Component
          {...commonProps}
          {...(item.type === PostType.WEEDZ_POST && { activePostId })}
        />
      );
    },
    [audioMute, activePostId, handlerAudioMute]
  );

  const renderHeader = useCallback(
    () => (
      <Fragment>
        <Header />
      </Fragment>
    ),
    []
  );

  const renderEmptyComponent = useCallback(() => {
    if (topContributors.isLoading) {
      return (
        <ActivityIndicator
          animating
          color="#fff"
          size="small"
          className="my-8"
        />
      );
    }

    if (topContributors.data.length > 0 && !posts.isLoading) {
      return (
        <View className="flex flex-1 flex-col gap-5 px-6 my-6">
          <Text className="text-lg text-white font-semibold">Sugestões</Text>
          <FlashList
            data={topContributors.data}
            horizontal
            estimatedItemSize={50}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(user) => user.id.toString()}
            renderItem={({ item }) => (
              <ContributorCard key={item.id} user={item} />
            )}
          />
        </View>
      );
    }

    return <View className="bg-black-100 h-full" />;
  }, [topContributors]);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 80 },
      onViewableItemsChanged: ({
        changed,
        viewableItems,
      }: {
        viewableItems: ViewToken<FeedAllPost>[];
        changed: ViewToken<FeedAllPost>[];
      }) => {
        const [change] = changed;
        const [viewableItem] = viewableItems;

        if (change && !change.isViewable) {
          pauseVideo();
        }

        if (viewableItem) {
          const isSocialOrGrow = [
            PostType.GROW_POST,
            PostType.SOCIAL_POST,
          ].includes(viewableItem.item.type);
          let file = (viewableItem.item.post as ReelsDetail).file;

          if (isSocialOrGrow) {
            file = (viewableItem.item.post as GrowPostDetail | PostDetail)
              .files[0];
          } else {
            setActivePostId(viewableItem.item.post.id);
          }

          if (file && file.type === "video") {   
            const oldPlayerIsMuted = isMuted();
            pauseVideo();
            setPlayer(file.player);
            toggleAudioMute(oldPlayerIsMuted);
            playVideo();
          }
        }
      },
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        pauseVideo();
        clearPlayer();
      };
    }, [])
  );

  return (
    <Fragment>
      <UpdateAppModal />
      <SafeAreaView
        style={{ flex: 1 }}
        className="bg-black-100"
        edges={["top"]}
      >
        <FlashList
          ref={setFlatListRef}
          className="bg-black-100"
          contentContainerClassName="gap-4"
          data={posts.data}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `key-${item.post.id}-${item.post.post_id}`}
          renderItem={renderItem}
          numColumns={1}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onEndReached={() => {
            if (posts.hasNextPage) {
              posts.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.8}
          ListFooterComponent={
            posts.isFetchingNextPage ? <Loader isLoading /> : null
          }
        />
      </SafeAreaView>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </Fragment>
  );
}

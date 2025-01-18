import { useState, Fragment, useRef, useCallback } from "react";
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
import GrowPostCard from "@/components/ui/grow-post-card";
import ContributorCard from "@/components/ui/contributor-card";
import Loader from "@/components/ui/loader";

import useHome from "@/hooks/useHome";
import { FeedAllPost, GrowPostDetail, PostDetail } from "@/api/@types/models";
import { useVideoPlayerContext } from "@/context/video-player-context";
import UpdateAppModal from "@/components/ui/update-app";
import { useScrollToTop } from "@/context/scroll-top-context";
import { useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audioMute, setAudioMute] = useState(false);

  const { pauseVideo, toggleAudioMute, playVideo, setPlayer, isMuted, clearPlayer, getPlayer } =
    useVideoPlayerContext();

  const { posts, topContributors } = useHome();
  const { setFlatListRef } = useScrollToTop();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const queryKeyValue =
      posts.data.length === 0 ? "top-contributors" : "home-posts";
    await queryClient.invalidateQueries({ queryKey: [queryKeyValue] });
    setIsRefreshing(false);
    pauseVideo();
    clearPlayer();
  }, [posts.data]);

  const loadComments = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["home-posts"] });
  }, []);

  const handlerAudioMute = useCallback(async (value: boolean) => {
    toggleAudioMute(value)
    setAudioMute(value)
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedAllPost>) => {

      if (item.type === "social") {
        return (
          <PostCard
            loadComments={loadComments}
            handlerAudioMute={handlerAudioMute}
            audioMute={audioMute}
            post={item.post as PostDetail}
          />
        );
      }
      return (
        <GrowPostCard
          post={item.post as GrowPostDetail}
          audioMute={audioMute}
          handlerAudioMute={handlerAudioMute}
          loadComments={loadComments}
        />
      );
    },
    [audioMute, loadComments, handlerAudioMute]
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
          const [file] = viewableItem.item.post.files;

          if (file && file.type === "video") {
            const oldPlayerIsMuted = isMuted()
            setPlayer(file.player);
            toggleAudioMute(oldPlayerIsMuted)
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
              posts.fetchNextPage()
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

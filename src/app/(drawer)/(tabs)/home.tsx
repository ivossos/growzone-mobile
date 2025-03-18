import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, RefreshControl, ActivityIndicator } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";

import { getPosts } from "@/api/social/post/get-posts";
import { PostType } from "@/api/@types/enums";

import { FeedAllPost } from "@/api/@types/models";

import { Header } from "@/components/ui/header";
import PostCard from "@/components/ui/post-card";
import WeedzPostCard from "@/components/ui/post-weedz-card";
import GrowPostCard from "@/components/ui/grow-post-card";
import ContributorCard from "@/components/ui/contributor-card";
import Loader from "@/components/ui/loader";
import useHome from "@/hooks/useHome";

import { colors } from "@/styles/colors";
import { useScrollToTop } from "@/context/scroll-top-context";
import UpdateAppModal from "@/components/ui/update-app";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const playerRef = useRef(new Map<string, any>());
  const lastActivePostId = useRef<number | any>(null);
  const lastsPostsCarrocelIndex = useRef<{ [postId: number]: number }>({});
  const isFocused = useIsFocused();

  const [viewableItems, setVisibleItems] = useState(new Set<unknown>());
  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };
  const { topContributors } = useHome();

  const [activePost, setActivePost] = useState<number | undefined>();

  const { setFlatListRef } = useScrollToTop();

  const handleVideoChange = useCallback((postId: number, videoIndex: number) => {
    const newPlayerKey = `${postId}-${videoIndex}`;
    const lastPlayerKey = `${lastActivePostId.current?.postId}-${lastActivePostId.current?.index}`;
  
    lastsPostsCarrocelIndex.current[postId] = videoIndex;
    if (newPlayerKey !== lastPlayerKey) {
      const lastPlayer = playerRef.current.get(lastPlayerKey);
      if (lastPlayer) {
        lastPlayer.pause();
      }
  
      const newPlayer = playerRef.current.get(newPlayerKey);
      if (newPlayer) {
        newPlayer.play();
      }
  
      setActivePost(postId);
      lastActivePostId.current = { postId, index: videoIndex };
    }
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length === 0) {
      return;
    }
  
    const firstVisibleItem = viewableItems.find((item: any) => item.isViewable);
  
    if (firstVisibleItem) {
      const newActivePostId = firstVisibleItem.item.post.post_id;
      const videoIndex = lastsPostsCarrocelIndex.current[newActivePostId] ?? 0;
  
      const newPlayerKey = `${newActivePostId}-${videoIndex}`;
      const lastPlayerKey = `${lastActivePostId.current?.postId}-${lastActivePostId.current?.index}`;
  
      if (newPlayerKey !== lastPlayerKey) {
        const lastPlayer = playerRef.current.get(lastPlayerKey);
        if (lastPlayer) {
          lastPlayer.pause();
        }
  
        const newPlayer = playerRef.current.get(newPlayerKey);
        if (newPlayer) {
          newPlayer.play();
        } 
  
        setActivePost(newActivePostId);
  
        lastActivePostId.current = { postId: newActivePostId, index: videoIndex };
      }
    }
  }, []);

  const renderEmptyComponent = useCallback(() => {
    if (loading) {
      return null;
    }

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

    if (topContributors.data.length > 0) {
      return (
        <View className="flex flex-1 flex-col gap-5 px-6 my-6">
          <Text className="text-lg text-white font-semibold">Sugestões</Text>
          <FlashList
            data={topContributors.data}
            horizontal
            estimatedItemSize={100}
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
  }, [topContributors.isLoading, topContributors.data, loading]);

  const fetchData = async (pageNum: number) => {
    try {
      const data = await getPosts({
        limit: 10,
        skip: pageNum,
        types: [
          PostType.GROW_POST,
          PostType.SOCIAL_POST,
          PostType.WEEDZ_POST,
        ] as PostType[],
      });
      return data;
    } catch (err) {
      setError("Erro ao carregar dados");
    }
  };

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
        setPage(0);
      }

      setLoading(true);

      try {
        if (isLastPage) return;

        const result = await fetchData(page);

        if (result && result.length < 10) {
          setIsLastPage(true);
        }

        if (isRefresh) {
          setData(result);
          setIsLastPage(false);
        } else {
          setData((prevData: any) => [...prevData, ...(result as any)]);
        }
      } catch (err) {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page]
  );

  const onRefresh = () => {
    loadData(true);
  };

  const handleEndReached = () => {
    if (!loading && !isLastPage) {
      setPage((prevPage) => prevPage + 10);
    }
  };

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
        playerRef,
        isVisible: activePost === item.post.post_id,
        onVideoChange: handleVideoChange,
      };

      return <Component {...commonProps} />;
    },
    [viewableItems]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (!isFocused) return;

      const currentPost = lastActivePostId.current;
      if (currentPost) {
        const playerKey = `${currentPost.postId}-${currentPost.index}`; 
        const currentPlayer = playerRef.current.get(playerKey);
        if (currentPlayer) {
          currentPlayer.play();
        }
      }

      return () => {
        const currentPost = lastActivePostId.current;
        if(currentPost) {
          const playerKey = `${currentPost.postId}-${currentPost.index}`;
          const currentPlayer = playerRef.current.get(playerKey);
          if (currentPlayer) {
            currentPlayer.pause();
          }
        }
      };
    }, [])
  );

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <UpdateAppModal />
      <SafeAreaView style={{ flex: 1 }} className="bg-black-100" edges={["top"]}>
        <FlashList
          ref={setFlatListRef}
          data={data}
          renderItem={renderItem}
          estimatedItemSize={400}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.8}
          numColumns={1}
          disableAutoLayout
          onViewableItemsChanged={onViewableItemsChanged}
          refreshing={isRefreshing}
          viewabilityConfig={viewabilityConfig}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Header />}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loading && !isRefreshing ? (
              <Loader isLoading />
            ) : (
              <View style={{ height: 100 }} />
            )
          }
        />
        <StatusBar backgroundColor={colors.black[100]} style="light" />
      </SafeAreaView>
    </>
  );
}

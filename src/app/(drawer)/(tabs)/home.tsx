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

export default function HomeScreen() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const playerRef = useRef(new Map<number, any>());
  const lastActivePostId = useRef<number | any>(null);
  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };
  const { topContributors } = useHome();
  const { setFlatListRef } = useScrollToTop();

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length === 0) return;

    viewableItems.forEach((item: any) => {
      const newActivePostId = item.item.post.id;
      const newPlayer = playerRef.current.get(newActivePostId);
      const lastPlayer = playerRef.current.get(lastActivePostId.current);

      if (lastPlayer && lastActivePostId.current !== newActivePostId) {
        lastPlayer.pause();
      }

      if (newPlayer) {
        newPlayer.play();
        lastActivePostId.current = newActivePostId;
      }
    });
  };

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
        setPage(10);
      }

      setLoading(true);

      try {
        if(isLastPage) return;

        const result = await fetchData(page);

        if(result && result.length < 10) {
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
    console.log("Carregar dados novamente com refresh");
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
      };

      return <Component {...commonProps} />;
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      const currentPlayer = playerRef.current.get(lastActivePostId.current);
      if (currentPlayer) {
        currentPlayer.play();
      }

      return () => {
        const currentPlayer = playerRef.current.get(lastActivePostId.current);
        if (currentPlayer) {
          currentPlayer.pause();
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
    <SafeAreaView style={{ flex: 1 }} className="bg-black-100" edges={["top"]}>
      <FlashList
        ref={setFlatListRef}
        data={data}
        renderItem={renderItem}
        estimatedItemSize={600}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
        numColumns={1}
        disableAutoLayout
        onViewableItemsChanged={onViewableItemsChanged}
        refreshing={isRefreshing}
        viewabilityConfig={viewabilityConfig}
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
  );
}

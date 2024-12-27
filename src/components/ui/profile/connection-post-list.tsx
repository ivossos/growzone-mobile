import { SocialPost } from "@/api/@types/models";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import { useAuth } from "@/hooks/use-auth";
import { replaceMediaUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import React, { forwardRef, memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { TimelineType } from "@/api/@types/enums";

const numColumns = 3;
const w = Dimensions.get("window").width;

type Props = {
  userId: number;
};

const ConnectionPostList = forwardRef<Animated.FlatList<SocialPost>, Props>(
  ({ userId, ...rest }, ref) => {
    const { user } = useAuth();
    const limit = 10;

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      refetch,
      error
    } = useInfiniteQuery({
      queryKey: ['profile-posts', userId.toString()],
      queryFn: async ({ pageParam = 0 }) => {
        return await getUserPosts({
          id: userId,
          skip: pageParam,
          limit,
        });
      },
      enabled: !!userId,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < limit) return undefined;
        return allPages.length * limit;
      },
      initialPageParam: 0,
    });

    if(error) {
      console.error("Erro ao buscar postagens:", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Aconteceu um erro ao buscar as postagens desse perfil. Tente novamente mais tarde.",
      });
      return null;
    }

    const posts = data?.pages.flat() ?? [];

    const renderItem = ({ item, index }: { index: number; item: SocialPost }) => {
      if (item.is_compressing) {
        if (user.id !== userId) return null;

        return (
          <View className="mb-1 bg-black-90">
            <View
              className="flex flex-row justify-center items-center"
              style={styles.image}
            >
              <ActivityIndicator size="small" color={colors.brand.green} />
            </View>
          </View>
        );
      }

      return (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/post/[id]/timeline/[userId]", params: { id: item.post_id, userId: userId, type: TimelineType.SOCIAL } })
          }
          className="mb-1"
        >
          {item?.file?.type === "image" ? (
            <Image
              source={{ uri: item?.file?.file }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={{ uri: replaceMediaUrl(item?.file?.file) }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <Animated.FlatList
        ref={ref}
        {...rest}
        data={posts}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.post_id.toString()}
        numColumns={numColumns}
        columnWrapperClassName="flex gap-1"
        contentContainerClassName="bg-black-100 mt-2"
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshing={isLoading}
        onRefresh={refetch}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="flex flex-row justify-center items-center py-4">
              <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
            </View>
          ) : null
        }
      />
    );
  }
);

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 3,
    height: 120,
  },
});

export default memo(ConnectionPostList);

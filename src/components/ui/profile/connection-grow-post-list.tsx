import { TimelineType } from "@/api/@types/enums";
import { GrowPost } from "@/api/@types/models";
import { getUserGrowPosts } from "@/api/social/post/get-user-grow-posts";
import { useAuth } from "@/hooks/use-auth";
import { replaceMediaUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { CalendarDaysIcon, Eye } from "lucide-react-native";
import React, { forwardRef, memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatListProps,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";

const numColumns = 2;
const w = Dimensions.get("window").width;

type Props = Omit<FlatListProps<GrowPost>, "renderItem"> & {
  userId: number;
};

const ConnectionGrowPostList = forwardRef<Animated.FlatList<GrowPost>, Props>(
  ({ userId, ...rest }, ref) => {
    const router = useRouter();
    const { user } = useAuth();
    const limit = 10;

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      refetch,
      error,
    } = useInfiniteQuery({
      queryKey: ["profile-post-grow", userId.toString()],
      queryFn: async ({ pageParam = 0 }) => {
        return await getUserGrowPosts({
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

    if (error) {
      console.error("Erro ao buscar postagens:", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          "Aconteceu um erro ao buscar as postagens desse perfil. Tente novamente mais tarde.",
      });
      return null;
    }

    const plants = data?.pages.flat() ?? [];

    const renderItem = ({ item }: { item: GrowPost }) => {
      if (item.is_compressing) {
        if (user.id != userId) return null;
        return (
          <View className="flex flex-col gap-2 mb-6">
            <View className="relative">
              <View
                className="flex flex-row justify-center items-center bg-black-90"
                style={styles.image}
              >
                <ActivityIndicator size="small" color={colors.brand.green} />
              </View>

              <View className="absolute bottom-4 left-2 bg-white px-2 py-1 rounded-full">
                <Text className="text-black text-xs ">{item.phase.name}</Text>
              </View>
            </View>

            <View className="flex flex-row justify-between items-center gap-2">
              {item.strain && (
                <Text
                  className="text-base text-brand-grey font-normal w-24 truncate"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.description}
                >
                  {item.strain.name}
                </Text>
              )}

              <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
                <CalendarDaysIcon size={12} color={colors.brand.green} />
                <Text className="text-brand-green text-xs ">
                  {item.day === 1 ? `${item.day} dia` : `${item.day} dias`}
                </Text>
              </View>
            </View>
          </View>
        );
      }

      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/post/[id]/timeline/[userId]",
              params: {
                id: item.post_id,
                userId: userId,
                type: TimelineType.GROW,
              },
            })
          }
          className="flex flex-col gap-2 mb-6"
        >
          <View className="relative">
            {item.file.type === "image" ? (
              <Image
                source={{ uri: item.file.file }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={{ uri: replaceMediaUrl(item?.file?.file) }}
                style={styles.image}
                resizeMode="cover"
              />
              //   <Video
              //   ref={ref => (videoRefs.current[index] = ref)}
              //   source={{ uri: item?.file?.file}}
              //   style={styles.image}
              //   isMuted={false}
              //   shouldPlay={false}
              //   isLooping={false}
              //   useNativeControls={false}
              // />
            )}

            <View className="absolute bottom-4 left-2 bg-white px-2 py-1 rounded-full">
              <Text className="text-black text-xs ">{item.phase.name}</Text>
            </View>
          </View>

          <View className="flex flex-row justify-between items-center gap-2">
            {item.strain && (
              <Text
                className="text-base text-brand-grey font-normal w-24 truncate"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.description}
              >
                {item.strain.name}
              </Text>
            )}

            <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
              <CalendarDaysIcon size={12} color={colors.brand.green} />
              <Text className="text-brand-green text-xs ">
                {item.day === 1 ? `${item.day} dia` : `${item.day} dias`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <Animated.FlatList
        ref={ref}
        {...rest}
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.post_id.toString()}
        numColumns={numColumns}
        contentContainerClassName="bg-black-100 mt-2"
        columnWrapperClassName="flex gap-6 px-4 w-full"
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        // onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="flex flex-row justify-center items-center py-4">
              <ActivityIndicator
                color="#fff"
                size="small"
                className="w-7 h-7"
              />
            </View>
          ) : null
        }
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100],
  },
  image: {
    width: w / numColumns - 24,
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns,
  },
  blurContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,

    elevation: 4,
  },
});

export default memo(ConnectionGrowPostList);

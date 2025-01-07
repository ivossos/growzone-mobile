import {
  GrowPost,
  GlobalSearchParams,
  GlobalSearchUser,
  SocialPost,
  UserDTO,
} from "@/api/@types/models";
import ContributorCard from "@/components/ui/contributor-card";
import { FormField } from "@/components/ui/form-field";
import ReelsCard from "@/components/ui/reels-card";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { colors } from "@/styles/colors";
import { Link, router } from "expo-router";
import { ArrowRight, Filter, Search, Video } from "lucide-react-native";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  MasonryFlashList,
  MasonryListRenderItemInfo,
} from "@shopify/flash-list";
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { debounce } from "lodash";
import { searchGlobal } from "@/api/social/global-search/search-global";
import Toast from "react-native-toast-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials, getUserName, replaceMediaUrl } from "@/lib/utils";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createFollow } from "@/api/social/follow/create-follow";
import { getTrendingWells } from "@/api/social/wells/get-trending-wells";
import { getTrendingGrowPosts } from "@/api/social/post/get-trending-grow-posts";
import { TrendingGrowCard } from "@/components/ui/trending-grow-card";
import { GlobalSearchType } from "@/api/@types/enums";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectGeneticDropdown from "@/components/ui/select-genetic-dropdown";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import Loader from "@/components/ui/loader";
import useFilterGlobalSearch from "@/hooks/useFilterGlobalSearch";
import { createVideoPlayer, VideoPlayer } from "expo-video";

export const searchGeneticValidation = z.object({
  strain: z
    .object({
      id: z.number().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  phase: z
    .object({
      id: z.number().nullable(),
    })
    .nullable(),
});

type GlobalSearch = GlobalSearchUser | GrowPost;
type FormFilterGenetic = {
  strain: {
    id: number | null;
    name: string | null;
  };
  phase: {
    id: number | null;
  };
};

export default function SearchScreen() {
  const form = useForm<FormFilterGenetic, FormFilterGenetic, FormFilterGenetic>(
    {
      resolver: zodResolver(searchGeneticValidation),
      defaultValues: {
        strain: { id: null, name: null },
        phase: { id: null },
      },
    }
  );

  const [phase, strain] = form.watch(["phase", "strain"]);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSectionSelected, setGlobalSectionSelected] =
    useState<GlobalSearchType>(GlobalSearchType.USER);

  const filterGlobalSearch = useFilterGlobalSearch({
    query: debouncedQuery,
    type: globalSectionSelected,
    phase_id: phase.id || 0,
    strain_id: strain.id || 0,
  });

  const { openBottomSheet } = useBottomSheetContext();

  const setValueFormFilter = async (
    filterData: Omit<FormFilterGenetic, "strain">
  ) => {
    form.setValue("phase", { id: filterData.phase?.id || null });
  };

  const handleOpenFilterBottomSheet = () => {
    openBottomSheet({ type: "search-genetic", callbackFn: setValueFormFilter });
  };

  const tabData = useMemo(
    () => [
      {
        key: GlobalSearchType.USER,
        label: "PERFIL",
        isSelected: (value: GlobalSearchType) =>
          value === GlobalSearchType.USER,
      },
      {
        key: GlobalSearchType.GROW_POST,
        label: "GENÉTICAS",
        isSelected: (value: GlobalSearchType) =>
          value === GlobalSearchType.GROW_POST,
      },
    ],
    []
  );

  const getAllTrendingGrowPosts = async (): Promise<GrowPost[]> => {
    const growPosts = await getTrendingGrowPosts({});

    return growPosts.map((growPost, index) => {
      let fileVideo = {} as VideoPlayer;

      if (growPost.file.type === "video") {
        fileVideo = createVideoPlayer({
          uri: growPost.file.file,
          metadata: {
            title: `title-grow-post-${index}`,
            artist: `artist-grow-post-${index}`,
          },
        });

        fileVideo.loop = true;
        fileVideo.muted = false;
        fileVideo.timeUpdateEventInterval = 2;
        fileVideo.volume = 1.0;
      }

      return {
        ...growPost,
        file: {
          ...growPost.file,
          player: fileVideo,
        },
      };
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["search-global-initial-page"],
    queryFn: async () => {
      const [topContributors, trendingWells, trendingGrowPosts] =
        await Promise.all([
          getTopContributors({}),
          getTrendingWells({}),
          getAllTrendingGrowPosts(),
        ]);
      return { topContributors, trendingWells, trendingGrowPosts };
    },
  });

  async function handleFollower(user: GlobalSearchUser) {
    try {
      setIsLoadingHandleFollower(true);

      if (user.is_following) {
        await deleteFollow(user.id);
      } else {
        await createFollow(user.id);
      }

      await queryClient.invalidateQueries({
        queryKey: ["search-global-initial-page"],
      });
    } catch (error) {
      console.error("erro on handleFollower", error);

      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro realizar essa açåo", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  }

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 300);

    handler();

    return () => {
      handler.cancel();
    };
  }, [query]);

  const handlerSessionTabsSearch = (type: GlobalSearchType) => {
    setGlobalSectionSelected(type);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (!isLoading) {
        await queryClient.invalidateQueries({
          queryKey: ["search-global-initial-page"],
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isLoading]);

  const handlerChangeValues = async () => {
    if (debouncedQuery) {
      await queryClient.invalidateQueries({
        queryKey: ["filtered-global-search"],
      });
    }
  };

  useEffect(() => {
    handlerChangeValues();
  }, [phase, strain, debouncedQuery, globalSectionSelected]);

  const profileTab = useMemo(() => {
    return (user: GlobalSearchUser) => (
      <Link
        key={user.id}
        className="px-4"
        href={{
          pathname: "/post/[id]",
          params: { id: user.id },
        }}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex flex-row items-center gap-2">
            <Avatar className="w-12 h-12 bg-black-80">
              {user.image?.image ? (
                <AvatarImage
                  className="rounded-full"
                  source={{ uri: user.image.image }}
                  resizeMode="contain"
                />
              ) : (
                <AvatarFallback textClassname="text-lg">
                  {getInitials(getUserName(user as UserDTO))}
                </AvatarFallback>
              )}
            </Avatar>

            <View>
              {user.name && (
                <Text className="text-white text-base text-start font-semibold">
                  {user.name}
                </Text>
              )}
              <Text
                className={`${
                  user?.name
                    ? "text-sm text-brand-grey text-start font-regular"
                    : "text-white text-base text-start font-semibold"
                }`}
              >
                {user.username}
              </Text>
            </View>
          </View>

          {user.id !== user.id && (
            <TouchableOpacity
              className={`px-3 py-1 rounded-[64px] ${
                user.is_following ? "bg-black-80" : "border border-brand-green"
              }`}
              onPress={() => handleFollower(user)}
            >
              {isLoadingHandleFollower ? (
                <ActivityIndicator
                  animating
                  color="#fff"
                  size="small"
                  className="ml-2"
                />
              ) : (
                <Text
                  className={`text-base ${
                    user.is_following ? "text-neutral-400" : "text-brand-green"
                  }`}
                >
                  {user.is_following ? "Seguindo" : "+ Seguir"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Link>
    );
  }, [handleFollower, isLoadingHandleFollower]);

  const geneticsTab = useMemo(() => {
    return (plant: GrowPost) => (
      <View key={plant.id} style={styles.item}>
        <TouchableOpacity
          onPress={() => router.push(`/post/${plant.post_id}/grow`)}
        >
          <View>
            <Image
              source={{
                uri: plant.file.type.includes("image")
                  ? plant.file.file
                  : replaceMediaUrl(plant.file.file),
              }}
              resizeMode="cover"
              style={styles.file}
            />

            {plant.file.type === "video" && (
              <View style={styles.videoIconContainer}>
                <Video size={18} color={colors.brand.white} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [router]);

  const tabSelect = useMemo(() => {
    if (debouncedQuery) {
      return (
        <View className="flex flex-row bg-black-90 px-12 py-7 rounded-lg border border-black-90 justify-around">
          {tabData.map((tab, index) => (
            <Fragment key={`tab_${tab.key}`}>
              <View
                className={`${
                  tab.isSelected(globalSectionSelected)
                    ? "border-b-2 border-brand-green"
                    : ""
                }`}
              >
                <TouchableOpacity
                  onPress={() => handlerSessionTabsSearch(tab.key)}
                >
                  <Text className="text-black-30 font-medium text-base">
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </View>
              {index < tabData.length - 1 && (
                <View>
                  <Text className="text-black-30 font-medium text-base">|</Text>
                </View>
              )}
            </Fragment>
          ))}
        </View>
      );
    }
  }, [debouncedQuery, tabData, globalSectionSelected]);

  const renderScreenTabSelected = useCallback(
    ({ item }: MasonryListRenderItemInfo<GlobalSearch>) => {
      if (debouncedQuery) {
        const screen = {
          [GlobalSearchType.USER]: profileTab,
          [GlobalSearchType.GROW_POST]: geneticsTab,
        };

        const Component = screen[globalSectionSelected];
        return Component(item as any);
      }
    },
    [debouncedQuery, geneticsTab, profileTab, globalSectionSelected]
  );

  const getColumnFlex = useCallback(() => {
    return globalSectionSelected === GlobalSearchType.USER ? 1 : 3;
  }, [globalSectionSelected]);

  if (isLoading || filterGlobalSearch.isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

  const {
    topContributors = [],
    trendingGrowPosts = [],
    trendingWells = [],
  } = data || {};

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 gap-4 bg-black-100 overflow-hidden">
        {globalSectionSelected === GlobalSearchType.USER && (
          <View className="flex flex-row gap-2 py-6 px-6">
            <FormField
              placeholder="Pesquisa Global"
              value={query}
              handleChangeText={(text) => {
                setQuery(text);
              }}
              type="clear"
              otherStyles="flex-1"
              leftIcon={Search}
            />
          </View>
        )}

        {globalSectionSelected === GlobalSearchType.GROW_POST && (
          <View className="flex flex-row items-center gap-6 p-4">
            <Controller
              control={form.control}
              name="strain"
              render={({ field: { onChange, value }, fieldState }) => (
                <View className="flex-1">
                  <SelectGeneticDropdown
                    placeholder="Selecione uma genética"
                    showClearIcon
                    initialValue={{
                      id: Number(value.id) || undefined,
                      label: value.name || undefined,
                    }}
                    handleChangeText={(selectedId, data) => {
                      onChange({
                        id: selectedId || null,
                        name: data.label || null,
                      });
                    }}
                    error={fieldState.error?.["strain"]?.message}
                  />
                </View>
              )}
            />

            <TouchableOpacity
              className="bg-black-80 justify-center items-center rounded-lg h-14 w-14"
              onPress={handleOpenFilterBottomSheet}
            >
              <Filter size={18} color={colors.brand.green} />
            </TouchableOpacity>
          </View>
        )}

        {tabSelect}

        {query && (
          <MasonryFlashList
            data={filterGlobalSearch.data}
            key={globalSectionSelected}
            renderItem={renderScreenTabSelected as any}
            keyExtractor={(item) => String(item.id)}
            numColumns={getColumnFlex()}
            getColumnFlex={getColumnFlex}
            estimatedItemSize={200}
            contentContainerStyle={styles.container}
            onEndReached={() =>
              filterGlobalSearch.hasNextPage &&
              filterGlobalSearch.fetchNextPage()
            }
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => {
              if (filterGlobalSearch.isLoading) {
                return (
                  <View className="flex items-center justify-center">
                    <ActivityIndicator animating color="#fff" size="small" />
                  </View>
                );
              }
            }}
            ListEmptyComponent={() => {
              if (
                !filterGlobalSearch.isLoading &&
                filterGlobalSearch.data.length === 0
              ) {
                return (
                  <View className="flex flex-col justify-center items-center py-6">
                    <Text className="text-base text-brand-grey">
                      Nenhum item foi encontrado para sua pesquisa
                    </Text>
                  </View>
                );
              }
            }}
          />
        )}

        {!query && (
          <FlatList
            data={[{ key: "contributors" }, { key: "reels" }, { key: "buds" }]}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-20 flex-grow"
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.brand.green}
              />
            }
            renderItem={({ item }) => {
              if (item.key === "contributors") {
                return (
                  !isRefreshing &&
                  topContributors.length > 0 && (
                    <View className="flex flex-col gap-5 px-6">
                      <Text className="text-lg text-white font-semibold">
                        Top Contribuidores
                      </Text>
                      <FlatList
                        data={topContributors}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(user) => user.id.toString()}
                        renderItem={({ item }) => (
                          <ContributorCard key={item.id} user={item} />
                        )}
                        contentContainerStyle={{ gap: 16 }}
                      />
                    </View>
                  )
                );
              } else if (item.key === "reels") {
                return (
                  !isRefreshing &&
                  trendingWells?.length > 0 && (
                    <View className="flex flex-col gap-5 px-6 pt-6">
                      <View className="flex flex-row justify-between items-center ">
                        <Text className="text-lg text-white font-semibold">
                          Weedz em Alta
                        </Text>
                        <TouchableOpacity
                          className="flex items-center flex-row gap-1"
                          onPress={() =>
                            router.navigate("/(drawer)/(tabs)/reels")
                          }
                        >
                          <Text className="text-primary text-base font-medium">
                            ver mais
                          </Text>
                          <ArrowRight size={18} color={colors.brand.green} />
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={trendingWells}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(post) => post.post_id.toString()}
                        renderItem={({ item }) => (
                          <ReelsCard key={item.id} {...item} />
                        )}
                        contentContainerStyle={{ gap: 16 }}
                      />
                    </View>
                  )
                );
              } else if (item.key === "buds") {
                return (
                  !isRefreshing &&
                  trendingGrowPosts?.length > 0 && (
                    <View className="flex flex-col gap-5 px-6 pt-6">
                      <View className="flex flex-row justify-between items-center ">
                        <Text className="text-lg text-white font-semibold">
                          Top Buds
                        </Text>
                        {/* <TouchableOpacity className="flex items-center flex-row gap-1" onPress={() => router.navigate('/reels')}>
                      <Text className="text-primary text-base font-medium">ver mais</Text>
                      <ArrowRight size={18} color={colors.brand.green}/>
                    </TouchableOpacity> */}
                      </View>
                      <FlatList
                        data={trendingGrowPosts}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(post) => post.post_id.toString()}
                        renderItem={({ item }) => (
                          <TrendingGrowCard key={item.id} item={item} />
                        )}
                        contentContainerStyle={{ gap: 16 }}
                      />
                    </View>
                  )
                );
              } else {
                return null;
              }
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  item: {
    margin: 2,
  },
  file: {
    aspectRatio: 1,
  },
  videoIconContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    borderRadius: 9999,
  },
});

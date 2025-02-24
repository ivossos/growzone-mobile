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
  ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { debounce } from "lodash";
import Toast from "react-native-toast-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import {
  buildErrorMessage,
  getInitials,
  getUserName,
  getMuxThumbnailUrl,
} from "@/lib/utils";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createFollow } from "@/api/social/follow/create-follow";
import { TrendingGrowCard } from "@/components/ui/trending-grow-card";
import { GlobalSearchType } from "@/api/@types/enums";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectGeneticDropdown from "@/components/ui/select-genetic-dropdown";
import { queryClient } from "@/lib/react-query";
import useFilterGlobalSearch from "@/hooks/useFilterGlobalSearch";
import HeaderGoBack from "@/components/ui/HeaderGoBack";
import { EXTRACTIONS_PHASE, RESULT_PHASE } from "@/constants";

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
      name: z.string().nullable(),
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
    name: string | null;
  };
};

const Section = ({
  title,
  data,
  renderItem,
  onPress,
  showMore = false,
}: {
  title: string;
  data: any[];
  renderItem: ({ item }: { item: any }) => JSX.Element;
  onPress?: () => void;
  showMore?: boolean;
}) => {
  if (data.length === 0) return null;

  return (
    <View className="flex flex-col gap-5 px-6 pt-6">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-lg text-white font-semibold">{title}</Text>
        {showMore && onPress && (
          <TouchableOpacity
            className="flex items-center flex-row gap-1"
            onPress={onPress}
          >
            <Text className="text-primary text-base font-medium">ver mais</Text>
            <ArrowRight size={18} color={colors.brand.green} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `item_${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  );
};

export default function SearchScreen() {
  const form = useForm<FormFilterGenetic, FormFilterGenetic, FormFilterGenetic>(
    {
      resolver: zodResolver(searchGeneticValidation),
      defaultValues: {
        strain: { id: null, name: null },
        phase: { id: null, name: null },
      },
    }
  );

  const [phase, strain] = form.watch(["phase", "strain"]);

  const { openBottomSheet } = useBottomSheetContext();

  const [startSearch, setStartSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSectionSelected, setGlobalSectionSelected] =
    useState<GlobalSearchType>(GlobalSearchType.USER);

  const globalSearch = useFilterGlobalSearch({
    query: debouncedQuery,
    type: globalSectionSelected,
    phase_id: phase.id || 0,
    strain_id: strain.id || 0,
    startSearch,
  });

  const {
    data: {
      topContributors,
      trendingWells,
      trendingGrowPostsResults,
      trendingGrowPostsExtration,
      growPosts,
    },
    isLoading,
  } = globalSearch.homeGlobalSearch || {};

  const filterGlobalSearch = globalSearch.globalSearch || {};

  const setValueFormFilter = async (
    filterData: Omit<FormFilterGenetic, "strain">
  ) => {
    form.setValue("phase", {
      id: filterData.phase?.id || null,
      name: filterData.phase?.name || null,
    });
  };

  const handleOpenFilterBottomSheet = () => {
    const data = {
      phase,
    };

    openBottomSheet({
      type: "search-genetic",
      callbackFn: setValueFormFilter,
      data,
    });
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

  const options = useMemo(() => {
    return [
      { key: "contributors" },
      { key: "reels" },
      { key: "plants" },
      { key: "buds" },
      { key: "extractions" },
    ];
  }, []);

  async function handleFollower(user: GlobalSearchUser) {
    try {
      setIsLoadingHandleFollower(true);

      if (user.is_following) {
        await deleteFollow(user.id);
      } else {
        await createFollow(user.id);
      }

      queryClient.removeQueries({ queryKey: ["search-global-initial-page"] });
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
    queryClient.removeQueries({ queryKey: ["filtered-global-search"] });
    setGlobalSectionSelected(type);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      queryClient.removeQueries({ queryKey: ["search-global-initial-page"] });
      queryClient.removeQueries({ queryKey: ["filtered-global-search"] });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isLoading]);

  const profileTab = useMemo(() => {
    return (user: GlobalSearchUser) => (
      <Link
        key={user.id}
        className="px-4 py-1 mt-2"
        href={{
          pathname: "/profile/[id]",
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
                  : getMuxThumbnailUrl(plant.file.file),
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
    if (startSearch) {
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
  }, [startSearch, tabData, globalSectionSelected]);

  const renderScreenTabSelected = useCallback(
    ({ item }: MasonryListRenderItemInfo<GlobalSearch>) => {
      if (startSearch) {
        const screen = {
          [GlobalSearchType.USER]: profileTab,
          [GlobalSearchType.GROW_POST]: geneticsTab,
        };

        const Component = screen[globalSectionSelected];
        return Component(item as any);
      }
    },
    [startSearch, globalSectionSelected, geneticsTab, profileTab]
  );

  const getColumnFlex = useCallback(() => {
    return globalSectionSelected === GlobalSearchType.USER ? 1 : 3;
  }, [globalSectionSelected]);

  const openGlobalSearchPlants = useCallback(
    async (type: "buds" | "plants" | "extractions") => {
      const phaseMap: Record<
        string,
        typeof EXTRACTIONS_PHASE | typeof RESULT_PHASE | null
      > = {
        extractions: EXTRACTIONS_PHASE,
        buds: RESULT_PHASE,
        plants: null,
      };

      const phase = phaseMap[type];
      if (phase) {
        form.setValue("phase", phase);
      }

      setGlobalSectionSelected(GlobalSearchType.GROW_POST);
      setStartSearch(true);
    },
    []
  );

  const handlerChangeSearchUserGlobal = useCallback((text: string) => {
    const hasText = !!text;
    setQuery(text);
    setStartSearch(hasText ? true : false);

    if (!hasText) {
      form.reset();
    }
  }, []);

  const handlerGoBack = useCallback(() => {
    setGlobalSectionSelected(GlobalSearchType.USER);
    setQuery("");
    form.reset();
    setStartSearch(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<{ key: string }>) => {
      if (isRefreshing) return null;

      switch (item.key) {
        case "contributors":
          return (
            <Section
              title="Top Contribuidores"
              data={topContributors}
              renderItem={({ item }) => (
                <ContributorCard key={item.id} user={item} />
              )}
            />
          );

        case "reels":
          return (
            <Section
              title="Weedz em Alta"
              data={trendingWells}
              renderItem={({ item }) => <ReelsCard key={item.id} {...item} />}
              showMore
              onPress={() => router.navigate("/(drawer)/(tabs)/reels")}
            />
          );

        case "buds":
          return (
            <Section
              title="Top Buds"
              data={trendingGrowPostsResults}
              showMore
              onPress={() => openGlobalSearchPlants("buds")}
              renderItem={({ item }) => (
                <TrendingGrowCard key={item.id} item={item} />
              )}
            />
          );

        case "extractions":
          return (
            <Section
              title="Top Extrações"
              data={
                trendingGrowPostsExtration.length > 6
                  ? trendingGrowPostsExtration
                  : []
              }
              showMore
              onPress={() => openGlobalSearchPlants("extractions")}
              renderItem={({ item }) => (
                <TrendingGrowCard key={item.id} item={item} />
              )}
            />
          );

        case "plants":
          return (
            <Section
              title="Plantas"
              data={growPosts}
              showMore
              onPress={() => openGlobalSearchPlants("plants")}
              renderItem={({ item }) => (
                <TrendingGrowCard key={item.id} item={item} />
              )}
            />
          );

        default:
          return null;
      }
    },
    [
      isRefreshing,
      topContributors,
      trendingWells,
      trendingGrowPostsResults,
      trendingGrowPostsExtration,
      openGlobalSearchPlants,
    ]
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-black-100 overflow-hidden ">
        <View className="flex flex-row items-center gap-2 px-4 py-6">
          {startSearch && (
            <View>
              <HeaderGoBack
                containerStyle={{
                  marginHorizontal: 4,
                }}
                onBack={handlerGoBack}
              />
            </View>
          )}

          {globalSectionSelected === GlobalSearchType.USER && (
            <View className="flex-1">
              <FormField
                placeholder="Pesquisa Global"
                value={query}
                handleChangeText={handlerChangeSearchUserGlobal}
                type="clear"
                otherStyles="w-full"
                leftIcon={Search}
              />
            </View>
          )}

          {globalSectionSelected === GlobalSearchType.GROW_POST && (
            <View className="flex flex-1 flex-row items-center gap-4">
              <Controller
                control={form.control}
                name="strain"
                render={({ field: { onChange, value, name }, fieldState }) => (
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
                      error={buildErrorMessage(name, fieldState.error)}
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
        </View>

        {tabSelect}

        {startSearch && (
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
                  <View className="flex items-center justify-center my-6">
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

        {!startSearch && (
          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-20 flex-grow"
            refreshing={isRefreshing}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.brand.green}
              />
            }
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 1,
  },
  item: {
    margin: 1,
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

import {
  GlobalSearchGrowPost,
  GlobalSearchParams,
  GlobalSearchResponse,
  GlobalSearchUser,
  GrowPost,
  SocialPost,
  UserDTO,
} from "@/api/@types/models";
import ContributorCard from "@/components/ui/contributor-card";
import { FormField } from "@/components/ui/form-field";
import ReelsCard from "@/components/ui/reels-card";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { colors } from "@/styles/colors";
import { Link, router, useFocusEffect } from "expo-router";
import { ArrowRight, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { debounce } from "lodash";
import { searchGlobal } from "@/api/social/global-search/seach-global";
import Toast from "react-native-toast-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials, getUserName } from "@/lib/utils";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createFollow } from "@/api/social/follow/create-follow";
import { getTrendingWells } from "@/api/social/wells/get-trending-wells";
import { getTrendingGrowPosts } from "@/api/social/post/get-trending-grow-posts";
import { TrendingGrowCard } from "@/components/ui/trending-grow-card";
import { GlobalSearchType } from "@/api/@types/enums";

type GlobalSearch = Array<GlobalSearchUser | GlobalSearchGrowPost>;

export default function SearchScreen() {
  const [searchResponse, setSearchResponse] = useState<GlobalSearch>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [topContributors, setTopContributors] = useState<UserDTO[]>([]);
  const [trendingWells, setTrendingWells] = useState<SocialPost[]>([]);
  const [trendingGrowPosts, setTrendingGrowPosts] = useState<GrowPost[]>([]);
  const [isLoadingTrendingGrowPosts, setIsLoadingTrendingGrowPosts] =
    useState(false);
  const [isLoadingTrendingWells, setIsLoadingTrendingWells] = useState(false);
  const [isLoadingTopContributors, setIsLoadingTopContributors] =
    useState(false);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalSectionSelected, setGlobalSectionSelected] =
    useState<GlobalSearchType>(GlobalSearchType.USER);

  const { openBottomSheet } = useBottomSheetContext();

  const handleOpenFilterBottomSheet = () => {
    openBottomSheet({ type: "search" });
  };

  const mapTypeSelectedTab = (type: GlobalSearchType) => {
    console.log("globalSectionSelected ", type);

    const mapValue: Record<GlobalSearchType, keyof GlobalSearchResponse> = {
      [GlobalSearchType.USER]: "users",
      [GlobalSearchType.GROW_POST]: "grow_posts",
    };

    return mapValue[type];
  };

  async function handleFollower(user: GlobalSearchUser) {
    try {
      setIsLoadingHandleFollower(true);

      if (user.is_following) {
        await deleteFollow(user.id);
      } else {
        await createFollow(user.id);
      }

      const updatedSearchResponse = searchResponse.map((u) =>
        u.id === user.id ? { ...u, is_following: !user.is_following } : u
      );

      setSearchResponse(updatedSearchResponse);
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

  const fetchTopContributors = async () => {
    try {
      setIsLoadingTopContributors(true);
      const data = await getTopContributors({});
      setTopContributors(data);
    } catch (error) {
      console.log("Erro ao buscar as top contributors: ", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2:
          "Aconteceu um erro ao buscar Top contributors. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoadingTopContributors(false);
    }
  };

  const fetchTrendingWells = async () => {
    try {
      setIsLoadingTrendingWells(true);
      const data = await getTrendingWells({});
      setTrendingWells(data);
    } catch (error) {
      console.log("Erro ao buscar as Trending Wells: ", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2:
          "Aconteceu um erro ao buscar Trending Wells. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoadingTrendingWells(false);
    }
  };

  const fetchTrendingGrowPosts = async () => {
    try {
      setIsLoadingTrendingGrowPosts(true);
      const data = await getTrendingGrowPosts({});
      setTrendingGrowPosts(data);
    } catch (error) {
      console.log("Erro ao buscar as GrowPosts: ", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2:
          "Aconteceu um erro ao buscar Top Buds. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoadingTrendingGrowPosts(false);
    }
  };

  const fetchGlobalSearch = async (params: GlobalSearchParams) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const paramValue: GlobalSearchParams = {
        ...params,
        query: debouncedQuery,
      };

      const res = await searchGlobal(paramValue);

      console.log("res ", JSON.stringify(res));

      // para geneteica funciona mas pra perfil nao
      const valueType = mapTypeSelectedTab(params.type);

      const resultData = res[valueType];

      if (resultData.length === 0) {
        setHasMore(false);
      } else {
        setSearchResponse((prev) => [...prev, ...resultData]);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar os usuários que esse perfil segue:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          "Aconteceu um erro buscar a pesquisa, tente novamente mais tarde.",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handlerSessionTabsSearch = (type: GlobalSearchType) => {
    if (globalSectionSelected !== type) {
      setHasMore(true);
      setSearchResponse([]);
      setSkip(0);
    }

    setGlobalSectionSelected(type);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTopContributors(),
        fetchTrendingWells(),
        fetchTrendingGrowPosts(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalSearch({
      skip,
      limit,
      type: globalSectionSelected,
      query: debouncedQuery,
    });
  }, [debouncedQuery, globalSectionSelected]);

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (hasMore) {
      fetchGlobalSearch({
        skip,
        limit,
        query: debouncedQuery,
        type: globalSectionSelected,
      });
    }
  }, [skip]);

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchTopContributors();
  //     fetchTrendingWells();
  //     fetchTrendingGrowPosts();
  //   }, [])
  // );

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const profileTab = useMemo(() => {
    if (query && globalSectionSelected === GlobalSearchType.USER) {
      return (searchResponse as GlobalSearchUser[]).map((user) => (
        <Link
          key={user.id}
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
                  user.is_following
                    ? "bg-black-80"
                    : "border border-brand-green"
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
                      user.is_following
                        ? "text-neutral-400"
                        : "text-brand-green"
                    }`}
                  >
                    {user.is_following ? "Seguindo" : "+ Seguir"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Link>
      ));
    }
  }, [query, searchResponse, isLoadingHandleFollower, globalSectionSelected]);

  const geneticsTab = useMemo(() => {
    if (query && globalSectionSelected === GlobalSearchType.GROW_POST) {
      return (searchResponse as GlobalSearchGrowPost[]).map((plants, index) => (
        <View key={index} className="w-1/3 mb-2">
          <TouchableOpacity
            onPress={() => router.push(`/post/${plants.post_id}/grow`)}
          >
            <View>
              <Image
                source={{ uri: plants.file.file }}
                resizeMode="contain"
                className="h-50 aspect-square"
              />
            </View>
          </TouchableOpacity>

        </View>
      ));
    }
  }, [query, searchResponse, globalSectionSelected]);

  const tabSelect = useMemo(() => {
    if (query) {
      return (
        <View className="flex flex-row bg-black-90 px-12 py-7 rounded-lg border border-black-90 justify-around">
          <View
            className={`${
              globalSectionSelected === GlobalSearchType.USER
                ? "border-b-2 border-brand-green"
                : ""
            }`}
          >
            <TouchableOpacity
              onPress={() => handlerSessionTabsSearch(GlobalSearchType.USER)}
            >
              <Text className="text-black-30 font-medium text-base">
                PERFIL
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text className="text-black-30 font-medium text-base">|</Text>
          </View>
          <View
            className={`${
              globalSectionSelected === GlobalSearchType.GROW_POST
                ? "border-b-2 border-brand-green"
                : ""
            }`}
          >
            <TouchableOpacity
              onPress={() =>
                handlerSessionTabsSearch(GlobalSearchType.GROW_POST)
              }
            >
              <Text className="text-black-30 font-medium text-base">
                GENÉTICAS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }, [query, globalSectionSelected]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 gap-4 bg-black-100 overflow-hidden">
        <View className="flex flex-row gap-2 py-6 px-6">
          <FormField
            placeholder="Pesquisa Global"
            value={query}
            handleChangeText={(text) => {
              setSearchResponse([]);
              setSkip(0);
              setHasMore(true);
              setQuery(text);
            }}
            type="clear"
            otherStyles="flex-1"
            leftIcon={Search}
          />
        </View>

        {tabSelect}

        {query && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={loadMorePosts}
          >
            {searchResponse.length !== 0 && (
              <View className="flex-row flex-wrap w-full">{geneticsTab}</View>
            )}

            {searchResponse.length !== 0 && (
              <View className="flex flex-col gap-4 mt-2 px-6 pb-[400px]">
                {profileTab}
              </View>
            )}

            {!loadingMore && searchResponse.length === 0 && (
              <View className="flex flex-col justify-center items-center py-6">
                <Text className="text-base text-brand-grey">
                  Nenhum item foi encontrado para sua pesquisa
                </Text>
              </View>
            )}
            {loadingMore && (
              <View className="flex items-center justify-center">
                <ActivityIndicator animating color="#fff" size="small" />
              </View>
            )}
          </ScrollView>
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
                          onPress={() => router.navigate("/reels")}
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

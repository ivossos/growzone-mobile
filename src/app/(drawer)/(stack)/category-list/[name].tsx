import { GlobalSearchResponse } from "@/api/@types/models";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { searchGlobal } from "@/api/social/global-search/seach-global";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { useRoute } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CategoryList: React.FC = () => {
  const route = useRoute();
  const categoryName = (route.params as { name: string })?.name;
  const [searchResponse, setSearchResponse] = useState<GlobalSearchResponse[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);

  const { user } = useAuth();

  const fetchUsersCategory = async (skipValue: number, limitValue: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await searchGlobal({ skip: skipValue, limit: limitValue, query: categoryName });

      if (res.length === 0) {
        setHasMore(false);
      } else {
        setSearchResponse((prev) => [...prev, ...res]);
      }
    } catch (error) {
      console.error("Erro ao carregar os usuários que esse perfil segue:", error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar a pesquisa, tente novamente mais tarde.',
      });
      router.back();
    } finally {
      setLoadingMore(false);
    }
  };

  async function handleFollower(user: GlobalSearchResponse) {
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
        text2: 'Aconteceu um erro realizar essa açåo", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  useEffect(() => {
    fetchUsersCategory(skip, limit);
  }, [skip, limit, categoryName]);

  const renderItem = ({ item }: { item: GlobalSearchResponse }) => (
    <View key={item.id} className="flex flex-row items-center justify-between w-full">
      <Link href={{ pathname: '/profile/[id]', params: { id: item.id } }}>
        <View className="flex flex-row items-center gap-2 ">
          <Avatar className="w-12 h-12 bg-black-80">
            {item?.image?.image ? (
              <AvatarImage
                className="rounded-full"
                source={{ uri: item.image.image }}
                resizeMode="contain"
              />
            ) : (
              <AvatarFallback textClassname="text-lg">
                {getInitials(item?.name || item?.username)}
              </AvatarFallback>
            )}
          </Avatar>
          <View>
            {item?.name && (
              <Text className="text-white text-base text-start font-semibold">
                {item?.name}
              </Text>
            )}
            <Text className={`${user?.name ? 'text-sm text-brand-grey text-start font-regular' : 'text-white text-base text-start font-semibold'}`}>
              {item?.username}
            </Text>
          </View>
        </View>
      </Link>
      {(user.id !== item.id) && (item.is_following ? 
        <TouchableOpacity style={{ backgroundColor: colors.black[70], borderRadius: 64, paddingVertical: 4, paddingHorizontal: 12 }} onPress={() => handleFollower(item)}>
          {isLoadingHandleFollower && (
            <ActivityIndicator animating color="#fff" size="small" className="ml-2" />
          )}
          {!isLoadingHandleFollower && <Text className="text-base text-neutral-400">Seguindo</Text>}
        </TouchableOpacity>
        :
        <TouchableOpacity style={{ borderColor: colors.brand.green, borderWidth: 1, borderRadius: 64, paddingVertical: 4, paddingHorizontal: 12 }} onPress={() => handleFollower(item)}>
          {isLoadingHandleFollower && (
            <ActivityIndicator animating color="#fff" size="small" className="ml-2" />
          )}
          {!isLoadingHandleFollower && <Text className="text-base text-brand-green ">+ Seguir</Text>}
        </TouchableOpacity>)
      }
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <View className="flex flex-col justify-center items-center mx-auto">
            <Text className="text-white text-sm font-semibold">
              Categoria
            </Text>
            <Text className="text-brand-green text-lg font-semibold">
              {categoryName}
            </Text>
          </View>
        </View>
        <FlatList
          data={searchResponse}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={loadMorePosts}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex flex-col gap-2 px-6 my-4"
          ListEmptyComponent={!loadingMore && searchResponse.length === 0 ? (
            <View className="flex flex-col justify-center items-center py-6">
              <Text className="text-base text-brand-grey">Nenhum item foi encontrado para sua pesquisa</Text>
            </View>
          ) : null}
          ListFooterComponent={loadingMore ? (
            <View className="flex items-center justify-center">
              <ActivityIndicator animating color="#fff" size="small" />
            </View>
          ) : null}
        />
      </View>
    </SafeAreaView>
  );
};

export default CategoryList;

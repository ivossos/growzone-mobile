import { colors } from "@/styles/colors";
import { useFocusEffect, useNavigation } from "expo-router";
import { BanIcon, ChevronLeft } from "lucide-react-native";
import { ActivityIndicator, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import LogoIcon from "@/assets/icons/logo-small.svg";
import { useCallback, useEffect, useState } from "react";

import { DrawerActions } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials } from "@/lib/utils";
import { Blocked } from "@/api/@types/models";
import Toast from "react-native-toast-message";
import { getBlockUsers } from "@/api/social/user/block/get-block-users";
import { debounce, uniqBy } from "lodash";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";

export default function BlockedUsers() {
  const [blockeds, setBlockeds] = useState<Blocked[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();

  const { openBottomSheet } = useBottomSheetContext();
 
  const fetchUsers = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getBlockUsers({ 
        skip: skipValue, 
        limit: limitValue,
        query: debouncedQuery
      });

      console.log(data)

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setBlockeds((prevPosts) => uniqBy([...prevPosts, ...data], 'id'));
      }
    } catch (error) {
      console.error('Erro ao buscar os usuários bloqueados: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar os usuários bloqueados. Tente novamente mais tarde.'
      });
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setBlockeds([]);
    await fetchUsers(0, limit);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts && blockeds.length >= 10) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const handleUnlockUser = (userId: number) => {
    openBottomSheet({
      type: "unlock-user",
      userId: userId,
      callbackFn: async () => {
        await onRefresh()
      }
    });
  }

  useEffect(() => {
    if (hasMorePosts) {      
      fetchUsers(skip, limit);
    }
  }, [skip, debouncedQuery]);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 500);

    handler();

    setSkip(0);
    setHasMorePosts(true);
    setBlockeds([]);
    return () => {
      handler.cancel();
    };
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  const toggleMenu = () => {
    navigation.goBack();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderItem = ({ item }: { item: Blocked}) => {
    return (
      <View key={item?.blocked?.id} className="flex flex-row items-center justify-between w-full">
    
      <View className="flex flex-row items-center gap-2">
        <Avatar className="w-12 h-12 bg-black-80">
          {item.blocked?.image?.image && (
            <AvatarImage
              className="rounded-full"
              source={{ uri: item?.blocked.image.image }}
            />
          )}
          <AvatarFallback>
            {getInitials(item?.blocked?.name || item?.blocked?.username)}
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-white text-lg text-start font-semibold">
            {item.blocked?.name || item?.blocked?.username}
          </Text>
        {item.blocked?.name && <Text className="text-brand-grey text-sm text-start font-regular">
            {item.blocked?.username}
          </Text>}
        </View>
      </View>
      <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px]" onPress={() => handleUnlockUser(item.blocked.id)}>
          <Text className="text-base text-neutral-400">Desbloquear</Text>
        </TouchableOpacity>
    </View>
    )
  }
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View className="flex-1 bg-black-100">
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={toggleMenu}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} height={30} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <BanIcon width={24} height={24} color={colors.brand.green} />
            <Text className="text-white text-lg font-semibold">
              Usuários bloqueados
            </Text>
          </View>

          <FlatList
            data={blockeds}
            contentContainerStyle={{ gap: 12, paddingBottom: 400 }}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerClassName="py-1"
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.1}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={() => (
              <View className="flex flex-1 items-center justify-center mt-10">
                <Text className="text-brand-grey text-base">Ainda não existe nenhum usuário bloqueado</Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => {
              if (loadingMore) {
                return (
                  <View className="flex items-center justify-center">
                    <ActivityIndicator animating color="#fff" size="small" />
                  </View>
                );
              }

              return null;
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

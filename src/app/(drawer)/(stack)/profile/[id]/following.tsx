import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Search } from "lucide-react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import LogoIcon from "@/assets/icons/logo-small.svg";
import UserIcon from "@/assets/icons/user-check.svg";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { Following } from "@/api/@types/models";
import { getInitials } from "@/lib/utils";
import { readFollowing } from "@/api/social/follow/read-following";
import { debounce } from 'lodash';

export default function FollowingPage() {
  const [following, setFollowing] = useState<Following[]>([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const normalizedId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 500);

    handler();

    return () => {
      handler.cancel();
    };
  }, [query]);

  const loadFollowing = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const res = await readFollowing({ id: parseInt(normalizedId), page, size: 50, query: debouncedQuery });
      setFollowing((prev) => [
        ...prev,
        ...res.filter((newUser) => !prev.some((existingUser) => existingUser.id === newUser.id))
      ]);
      setHasMore(res.length > 0);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao carregar os usuários que esse perfil segue:", error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar os usuários que esse perfil segue, tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowing();
  }, [debouncedQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFollowing();
    }
  };

  return(
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} heigth={11} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <UserIcon width={24} heigth={24} />
            <Text className="text-white text-lg font-semibold">
              Seguindo
            </Text>
          </View>

          <FormField
            placeholder="Buscar"
            value={query}
            handleChangeText={(text) => {
              setFollowing([]);
              setPage(0);
              setHasMore(true);
              setQuery(text);
            }}
            rightIcon={Search}
          />

          <ScrollView 
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleLoadMore}
          >
            <View className="flex flex-col gap-4 pb-[400px]">
              {following.map(user => (
                <View key={user.id} className="flex flex-row items-center justify-between w-full">
                <View className="flex flex-row items-center gap-2 ">
                  <Avatar className="w-12 h-12 bg-black-80">
                    {user.followed?.image?.image ? (
                        <AvatarImage
                          className="rounded-full"
                          source={{ uri: user.followed.image.image }}
                          resizeMode="contain"
                        />
                      ) : (
                        <AvatarFallback textClassname="text-lg">
                          {getInitials(user?.followed?.name || user?.followed?.username)}
                        </AvatarFallback>
                      )}
                  </Avatar>
                  <View>
                    {user?.followed?.name && (
                        <Text className="text-white text-base text-start font-semibold">
                          {user?.followed?.name}
                        </Text>
                      )}
                    <Text className={`${ user?.followed?.name ? 'text-sm text-brand-grey text-start font-regular' : 'text-white text-base text-start font-semibold'}`}>
                      {user?.followed?.username}
                    </Text>
                  </View>
                </View>

                {false ? 
                  <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px] ">
                    <Text className="text-base text-neutral-400">Seguindo</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px] ">
                    <Text className="text-base text-brand-green ">+ Seguir</Text>
                  </TouchableOpacity>
                }

              </View>
              ))}
              {loading && (
                <View className="flex items-center justify-center">
                  <ActivityIndicator
                    animating
                    color="#fff"
                    size="small"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

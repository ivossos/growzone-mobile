import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, RefreshControl} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import NotificationIcon from "@/assets/icons/notification-green.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getNotifications } from "@/api/social/notification/get-notifications";
import { Notification } from "@/api/@types/models";
import { formatDistance, getInitials, getMuxThumbnailUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { orderBy, uniqBy } from "lodash";
import { useAuth } from "@/hooks/use-auth";


export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { user } = useAuth();

  const fetchNotifications = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getNotifications({ skip: skipValue, limit: limitValue });
      if (data.length === 0) {
        setHasMoreNotifications(false);
      } else {
        setNotifications((prevNotifications) => orderBy(uniqBy([...prevNotifications, ...data], 'id'), 'created_at', 'desc'));
      }
    } catch (error) {
      console.error("Erro ao buscar as notificações: ", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2: "Aconteceu um erro ao buscar as notificações. Tente novamente mais tarde.",
      });

      router.back();
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMoreNotifications(true);
    setNotifications([]);
    await fetchNotifications(0, limit);
  };

  useEffect(() => {
    if (hasMoreNotifications) {
      fetchNotifications(skip, limit);
    }
  }, [skip]);

  // useFocusEffect(
  //   useCallback(() => {
  //     onRefresh();
  //   }, [])
  // );

  const loadMoreNotifications = () => {
    if (!loadingMore && hasMoreNotifications) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const handlePress = (item: Notification) => {
    if(item.type.name === 'Follow Profile') {
      router.push({
        pathname: '/profile/[id]',
        params: { id: item.sender.id },
      });
    } else if(item.type.name === 'Review Profile') {
      router.push({
        pathname: '/profile/[id]',
        params: { id: user.id },
      });
    } else if (item.post.type === 'social') {
      router.push({
        pathname: '/post/[id]', // brendo aqui olhar depois
        params: { id: item.post.id },
      });
    } else if (item.post.type === 'grow') {
      router.push({
        pathname: '/post/[id]/grow',
        params: { id: item.post.id },
      });
    } else if (item.post.type === 'reel') {
      router.push({
        pathname: '/post/[id]/reels',
        params: { id: item.post.id },
      });
    } else {
      return;
    }
    
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      onPress={() => handlePress(item)}
      key={item.id + item.sender.username} 
      className="flex flex-row items-center justify-between h-[72px] bg-black-90 px-4 rounded-lg"
    >
      <View className="flex flex-row items-center gap-2">
        <Avatar className="w-10 h-10 bg-black-80">
          {item.sender?.image ? (
            <AvatarImage className="rounded-full" src={item.sender.image.image} />
          ) : (
            <AvatarFallback>{getInitials(item.sender?.name || item.sender?.username)}</AvatarFallback>
          )}
        </Avatar>
        <View className="flex flex-col justify-center gap-2">
          <Text className="text-white text-sm text-start font-semibold" numberOfLines={1} ellipsizeMode="tail">
            {item.sender?.name || item.sender?.username}
            <Text className="font-regular">{` ${item.type.description}`}</Text>
          </Text>
          <View className="flex flex-row items-center gap-1">
            <Text className="text-xs text-brand-grey">{formatDistance(item.created_at)}</Text>
            {!item.is_read && <NotificationIcon width={12} heigth={12} />}
          </View>
        </View>
      </View>
      {item.type.name !== 'Report Post' && item.post &&(
        <View>
          {item.post.file.type === 'image'  && (
            <Image
              source={{ uri: item.post.file.file }}
              width={40}
              height={40}
              className="rounded-lg"
              resizeMode="cover"
            />
          )}
          {item.post.file.type === 'video'  && (
            <Image
            source={{ uri: getMuxThumbnailUrl(item.post.file.file) }}
            style={{
              height: 40, 
              width: 40,
              borderRadius: 8
            }}
              resizeMode="cover"
          />
          )}
        </View>
      )
      }
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">Notificações</Text>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={onRefresh}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.green}
            />
          }
          contentContainerClassName="gap-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

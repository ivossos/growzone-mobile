import { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, RefreshControl, FlatList, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/header';
import { Stories } from '@/components/ui/stories';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { getPosts } from '@/api/social/post/get-posts';
import Toast from 'react-native-toast-message';
import { PostDetail } from '@/api/@types/models';
import PostCard from '@/components/ui/post-card';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [posts, setPosts] = useState<PostDetail[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getPosts({ skip: skipValue, limit: limitValue });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error('Erro ao buscar as postagens: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar as postagens. Tente novamente mais tarde.'
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
    setPosts([]);
    await fetchPostsData(0, limit);
  };

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const openBottomSheet = (post: PostDetail) => {
    setSelectedPost(post);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const renderHeader = () => (
    <>
      <Header />
      <Stories />
    </>
  );

  const renderEmptyComponent = () => (
    <View className="bg-black-100 h-full" />
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} className="bg-black-100" edges={['top']}>
        <FlatList
          className="bg-black-100"
          data={posts}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `key-${item.post_id.toString()}`}
          renderItem={({ item }) => (
            <PostCard post={item}  />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loadingMore ? (
            <View className="flex flex-row justify-center items-center py-4">
              <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
            </View>
          ) : null}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </SafeAreaView>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </>
  );
}

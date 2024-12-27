import { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import { View, RefreshControl, FlatList, ActivityIndicator, Text, ViewabilityConfigCallbackPair } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/header';
import { Stories } from '@/components/ui/stories';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import Toast from 'react-native-toast-message';
import { FeedAllPost, GrowPostDetail, PostDetail, UserDTO } from '@/api/@types/models';
import PostCard from '@/components/ui/post-card';
import { getPosts } from '@/api/social/post/get-posts';
import GrowPostCard from '@/components/ui/grow-post-card';
import { getTopContributors } from '@/api/social/contributor/get-top-contributors';
import ContributorCard from '@/components/ui/contributor-card';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useScrollToTop } from '@/context/scroll-top-context';
import { useActivePostHome } from '@/hooks/use-active-post-home';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<FeedAllPost[]>([]);
  const [topContributors, setTopContributors] = useState<UserDTO[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingTopContributors, setIsLoadingTopContributors] = useState(false);
  const { setFlatListRef } = useScrollToTop();

  const { refresh } = useLocalSearchParams();
  const { activePostId, handlePostChange } = useActivePostHome();

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getPosts({ skip: skipValue, limit: limitValue });
      const postsFilter = data.filter((post) => {
        return post.type !== 'reel'
      })

      if (postsFilter.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...postsFilter]);
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

  const fetchTopContributors = async () => {
    try {

      setIsLoadingTopContributors(true);
      const data = await getTopContributors({});
      setTopContributors(data);
    } catch (error) {
      console.log('Erro ao buscar as top contributors: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar Top contributors. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoadingTopContributors(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setPosts([]);
    await fetchPostsData(0, limit);
  };

  const loadComments = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
  
    try {
      const data = await getPosts({ skip: 0, limit });
      setPosts(data);
    } catch (error) {
      console.error("Erro ao recarregar os comentários:", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2: "Erro ao recarregar os comentários. Tente novamente mais tarde.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = useCallback(({ item }: any) => {    
    if (item.type === 'social') {
      return <PostCard loadComments={loadComments} post={item.post as PostDetail} />;
    } else {
      return <GrowPostCard post={item.post as GrowPostDetail} />;
    }
  }, [activePostId, posts]);

  useEffect(() => {  
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  useEffect(() => {
    if (posts.length === 0 && !loadingMore) {
      fetchTopContributors()
    }
  }, [posts, loadingMore]);

  useEffect(() => {
    if (refresh) {
      onRefresh()
    }
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      if(posts.length === 0  && !loadingMore) {
        fetchTopContributors();
      }
      }, [posts, loadingMore])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        handlePostChange(null);
      };
    }, [])
  );

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const renderHeader = () => (
    <Fragment>
      <Header />
      {/* <Stories /> */}
    </Fragment>
  );

  const renderEmptyComponent = () => {
    if(loadingMore) return null;

    if (isLoadingTopContributors) {
      return (
        <ActivityIndicator
          animating
          color="#fff"
          size="small"
          className="my-8"
        />
      );
    }
  
    if (topContributors.length > 0) {
      return (
        <View className="flex flex-1 flex-col gap-5 px-6 my-6">
          <Text className="text-lg text-white font-semibold">
            Sugestões
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
      );
    }
  
    return <View className="bg-black-100 h-full" />;
  };

  const viewabilityConfigCallbackPairs = useRef<ViewabilityConfigCallbackPair[]>([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 80 },
      onViewableItemsChanged: ({ viewableItems }) => {
        if (viewableItems?.length > 0 && viewableItems[0].isViewable &&
          activePostId !== viewableItems[0].item.post.post_id) {
          handlePostChange(viewableItems[0].item.post.post_id);
        }
      },
    },
  ]);
  

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 1 }} className="bg-black-100" edges={['top']}>
        <FlatList
          ref={setFlatListRef}
          className="bg-black-100"
          contentContainerClassName="gap-4"
          data={posts}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `key-${item.post.id}-${item.post.post_id}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <View className="flex flex-row justify-center items-center py-4">
              <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
            </View>
          ) : null}

          initialNumToRender={3}
          maxToRenderPerBatch={5} 
          windowSize={10}
        />
      </SafeAreaView>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </Fragment>
  );
}

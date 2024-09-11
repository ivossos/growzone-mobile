import { useRef, useState } from 'react';
import { Image, StyleSheet, Platform, ScrollView, View, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/header';
import { Stories } from '@/components/ui/stories';
import { PostCard } from '@/components/ui/post-card';
import { postsMock } from '@/constants/mock';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';


export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const openBottomSheet = (post: any) => {
    setSelectedPost(post);
    bottomSheetRef.current?.snapToIndex(1); // ou o índice que desejar
  };

  function fetchData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("")
      }, 2000);
    });
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData()
    setRefreshing(false);
  };

  return (
    <>
     <SafeAreaView style={{ flex: 1}} className='bg-black-100'  edges={['top']}>
       <FlatList
        className='bg-black-100'
        data={postsMock}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `key-${item.id}`}
        renderItem={({ item }) => <PostCard post={item} openBottomSheet={() => openBottomSheet(item)}  />}
        
        ListHeaderComponent={() => (
          <>
            <Header />
            <Stories />
          </>
        )}
        ListEmptyComponent={() => (
          // <EmptyState
          //   title="No Videos Found"
          //   subtitle="No videos created yet"
          // />
          <View className='bg-black-100 h-full'></View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView> 
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </>
  );
}
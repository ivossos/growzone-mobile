import { useRef, useState } from 'react';
import { Image, StyleSheet, Platform, ScrollView, View, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/header';
import { Stories } from '@/components/ui/stories';
import { CardPost } from '@/components/ui/card-post';
import { postsMock } from '@/constants/mock';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';


export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const openBottomSheet = (post) => {
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
    <SafeAreaView className='bg-black-100'>
       <FlatList
       className='h-100'
        data={postsMock}
        keyExtractor={(item) => `key-${item.id}`}
        renderItem={({ item }) => <CardPost post={item} openBottomSheet={() => openBottomSheet(item)}  />}
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
          <></>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {/* <ScrollView showsHorizontalScrollIndicator={false} className='flex flex-rowflex-1'>
        <Header />
        <Stories />
        {postsMock.map(post => (
          <CardPost key={post.id} post={post} />
        ))}
      </ScrollView> */}
    </SafeAreaView>
  );
}
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { commentsMock } from '@/constants/mock';
import { Avatar, AvatarImage } from '../Avatar';
import { DotIcon, EllipsisIcon } from 'lucide-react-native';
import { useCommentContext } from '@/context/comment-context';
import LikeIcon from "@/assets/icons/like.svg";
import CommentIcon from "@/assets/icons/comment.svg";

const CommentBottomSheet = () => {
  const { postId, isVisible, closeBottomSheet } = useCommentContext();

  if (!isVisible) return null;
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View className='flex flex-col flex-1 gap-2 bg-black-100 mb-4'>
        <View className="flex flex-row items-center justify-between gap-2 w-full">
          <View className="flex flex-row items-center gap-2 ">
            <Avatar className="w-10 h-10">
              <AvatarImage
                className="rounded-full"
                source={require("@/assets/images/profile2.png")}
              />
            </Avatar>
            <View className='flex flex-row items-center'>
              <Text className="text-white text-sm text-center font-semibold">
                Pedro Oliveira
              </Text>
              <DotIcon className="w-3 h-3" color={colors.black[70]} />
              <Text className="text-brand-grey text-xs">agora mesmo</Text>
            </View>
          </View>

          <View className="flex flex-row items-center">
            <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
          </View>
        </View>
        <View className='flex flex-row gap-2'>
          <View className='max-w-10 w-full'>
            <View className='h-full w-[1px] bg-black-80 mx-auto' />
          </View>
         
          <View className='flex flex-col flex-1'>
            <Text className="text-start text-sm text-brand-grey font-normal max-w-full">
              Se for para consumo da flor. Costumo colher com cerca de 80/90% dos pistilos já marrom e os tricomas com 20/25% deles âmbar.
            </Text>
            <View className="flex flex-row items-center gap-3 mt-2">
              <TouchableOpacity className="flex flex-row items-center gap-1">
                <LikeIcon width={24} height={24} />
                <Text className="text-white font-medium">75</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex flex-row items-center gap-1" >
                <CommentIcon width={24} height={24} />
                <Text className="text-white font-medium">75</Text>
              </TouchableOpacity>
            </View>

          </View>
          
        </View>
      </View>
    ),
    []
  );



  return (
    <BottomSheet
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100]}}
      backdropComponent={renderBackdrop}
      onClose={closeBottomSheet}
    >
      <BottomSheetFlatList
          data={commentsMock}
          className="h-full p-6"
          keyExtractor={(i) => 'key-' + i.id}
          renderItem={renderItem}
        />
    </BottomSheet>
  );
}

export default CommentBottomSheet;
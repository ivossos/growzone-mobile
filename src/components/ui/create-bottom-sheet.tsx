import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import PostIcon from "@/assets/icons/post.svg";
import ReelsIcon from "@/assets/icons/reels-green.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import PollIcon from "@/assets/icons/poll.svg";
import TopicIcon from "@/assets/icons/topic.svg";
import CommunityIcon from "@/assets/icons/community-green.svg";

const CreateBottomSheet = React.forwardRef<BottomSheet>((_, ref) => {
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100]}}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView className="flex flex-col flex-1 gap-2 p-6 bg-black-100">
        {[
          { Icon: PostIcon, title: 'Post', description: 'Compartilhe seus pensamentos com um post' },
          { Icon: ReelsIcon, title: 'Reels', description: 'Crie vídeos curtos e envolventes com Reels' },
          { Icon: QuestionIcon, title: 'Pergunta', description: 'Crie perguntas em uma comunidade' },
          { Icon: PollIcon, title: 'Enquete', description: 'Crie enquetes em uma comunidade' },
          { Icon: TopicIcon, title: 'Tópico', description: 'Inicie uma discussão em uma comunidade' },
          { Icon: CommunityIcon, title: 'Comunidade', description: 'Crie sua própria comunidade' },
        ].map((item, index) => (
          <TouchableOpacity key={index} className='flex flex-row items-center gap-2 border border-black-80 rounded-lg p-4'>
            <item.Icon width={24} height={24} />
            <View>
              <Text className="text-base font-medium text-brand-white">{item.title}</Text>
              <Text className="text-sm font-medium text-brand-grey">{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default CreateBottomSheet;
import StoriesIcon from '@/assets/icons/stories.svg';
import { Text, View, ScrollView } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { stories } from '@/constants/mock';

export function Stories() {
  
  return (
    <View className="flex flex-col gap-6 mx-6 mt-6">
      <View className="flex flex-row items-center gap-2 w-[70px]">
        <StoriesIcon width={24} height={24} />
        <Text className="text-white text-lg font-semibold">Takes</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ gap: 12 }}>
        <View className="flex flex-col items-center gap-2 ">
          <Avatar className="min-w-16 w-16 h-16 border border-black-90 p-1">
            <AvatarImage
              className="rounded-full"
              source={require('@/assets/images/add-storie.png')}
            />
          </Avatar>
          <Text
            className="text-white text-sm text-center font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Adicionar
          </Text>
        </View>

        {stories.map((story) => (
          <View key={story.id} className="flex flex-col items-center gap-2 min-w-16 w-16">
            <Avatar className="min-w-18 w-18 h-16 border border-primary p-1">
              <AvatarImage
                className="rounded-full"
                source={typeof story.uri === 'string' ? { uri: story.uri } : story.uri}
              />
              <AvatarFallback>{story.nameFallback}</AvatarFallback>
            </Avatar>
            <Text
              className="text-brand-grey text-sm text-center font-medium"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {story.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

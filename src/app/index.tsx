import { Image, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import { router } from 'expo-router';
import Button from '@/components/ui/button';


export default function Welcome() {
  return (
    <SafeAreaView className='bg-red-500 h-full'>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className='w-full justify-center items-center h-full px-4'>
          <Image source={images.logoGreen} className='w-[214px] h-[30px]'  resizeMode='contain'/>
          <Button
          handlePress={() => router.push("/sign-in")}
          containerStyles="mt-7"
          title='Opa'
          textStyles='mt'
          isLoading={false}
        />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
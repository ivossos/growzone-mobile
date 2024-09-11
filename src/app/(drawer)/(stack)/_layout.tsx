import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"
import { colors } from '@/styles/colors';

export default function PostLayout() {
 
  return (
    <>
    <Stack screenOptions={{
      headerShown: false,
      // animation: 'slide_from_right', // Animação ao abrir a tela
      // animationDuration: 500, // Duração da transição em milissegundos
      // cardStyleInterpolator: ({ current, layouts }) => {
      //   return {
      //     cardStyle: {
      //       opacity: current.progress,
      //       transform: [
      //         {
      //           translateX: current.progress.interpolate({
      //             inputRange: [0, 1],
      //             outputRange: [layouts.screen.width, 0],
      //           }),
      //         },
      //       ],
      //     },
      //   };
      // },
      }} 
    /> 

    <StatusBar backgroundColor={colors.black[100]} style="light" />
  </>
  );
}

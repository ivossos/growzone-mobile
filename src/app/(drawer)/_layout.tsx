import { CustomOptions } from '@/@types/navigation'
import { DrawerContent } from '@/components/ui/drawer-content'
import { Drawer } from 'expo-router/drawer'
import ProfileIcon from "@/assets/icons/profile.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import FileIcon from "@/assets/icons/file.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { useAuth } from '@/hooks/use-auth';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import BottomSheet from '@gorhom/bottom-sheet';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';
import ReportBottomSheet from '@/components/ui/report-bottom-sheet';
import RateProfileBottomSheet from '@/components/ui/rate-profile-bottom-sheet';
import { colors } from '@/styles/colors';
import { StatusBar } from 'expo-status-bar';

export default function DrawerLayout() {
  const { user, signOut, isLoadingUserStorage } = useAuth();
  const router = useRouter();
  const reportSheetRef = useRef<BottomSheet>(null);
  const commentSheetRef = useRef<BottomSheet>(null);
  const rateProfileSheetRef = useRef<BottomSheet>(null);

  const closeReportBottomSheet = () => {
    reportSheetRef.current?.close()
  };

  const rateProfileBottomSheet = () => {
    rateProfileSheetRef.current?.close()
  };
 
  useEffect(() => {
    if (user?.id && !isLoadingUserStorage) {
      if (!user.is_verified) {
        router.replace('/verify-user');
      } else if(!user.category_id || user.category_id === 0) {
        router.replace('/user-category');
      } 
    }
  }, [user, isLoadingUserStorage, router]);

  const logout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  if (!user?.id && !isLoadingUserStorage) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <BottomSheetProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerPosition: 'right',
          drawerStyle: {
            width: '100%'
          },
          swipeEnabled: false,
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name='(tabs)' />

        <Drawer.Screen
          name="edit-profile"
          options={
            {
              title: 'Dados gerais',
              iconName: ProfileIcon,
              isDivider: true,
              animationEnabled: true,
            } as CustomOptions
          }
        />

        {/* <Drawer.Screen
          name="event"
          options={
            {
              title: 'Eventos',
              iconName: CalenderIcon,
              isDivider: true,
            } as CustomOptions
          }
        /> */}


        <Drawer.Screen
          name="security"
          options={
            {
              title: 'Segurança',
              iconName: PadlockIcon,
              isDivider: true,
            } as CustomOptions
          }
        />

        {/* <Drawer.Screen
          name="preference-center"
          options={
            {
              title: 'Central de preferências',
              iconName: SettingsIcon,
              isDivider: true,
            } as CustomOptions
          }
        /> */}

        <Drawer.Screen
          name="terms-conditions"
          options={
            {
              title: 'Termos e condições',
              iconName: FileIcon,
              isDivider: true,
            } as CustomOptions
          }
        />

        <Drawer.Screen
          name="help"
          options={
            {
              title: 'Ajuda',
              iconName: QuestionIcon,
              isDivider: true,
            } as CustomOptions
          }
        />

        {/* <Drawer.Screen
          name="user-category"
          options={
            {
              title: 'Perfil Grower',
              iconName: FileIcon,
              isDivider: true,
            } as CustomOptions
          }
        /> */}

        {/* <Drawer.Screen
          name="privacy-policy"
          options={
            {
              title: 'Política de privacidade',
              iconName: SecurityIcon,
              isDivider: true
            } as CustomOptions
          }
        /> */}

        <Drawer.Screen
          listeners={{
            drawerItemPress: (e) => {
              e.preventDefault();
              logout();
            },
          }}
          name="logout"
          options={{
            title: 'Encerrar sessão',
            iconName: CloseIcon,
          } as CustomOptions}
        />
        
      </Drawer>
      <CommentBottomSheet ref={commentSheetRef} />
      <ReportBottomSheet ref={reportSheetRef}  onClose={closeReportBottomSheet}/>
      <RateProfileBottomSheet ref={rateProfileSheetRef} onClose={rateProfileBottomSheet}/>
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </BottomSheetProvider>
      
  )
}
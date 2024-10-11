import { CustomOptions } from '@/@types/navigation'
import { DrawerContent } from '@/components/ui/drawer-content'
import { Drawer } from 'expo-router/drawer'
import ProfileIcon from "@/assets/icons/profile.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import FileIcon from "@/assets/icons/file.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { useAuth } from '@/hooks/use-auth';
import { Redirect, router, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function DrawerLayout() {
  const { user, signOut, isLoadingUserStorage } = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    if (user?.id && !isLoadingUserStorage) {
      if (!user.is_verified) {
        router.replace('/verify-user');
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
    <>
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
        <Drawer.Screen name='(stack)' />

        <Drawer.Screen
          name="edit-profile"
          options={
            {
              title: 'Dados gerais',
              iconName: ProfileIcon,
              isDivider: true,
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
          name="user-category"
          options={
            {
              title: 'Perfil Grower',
              iconName: FileIcon,
              isDivider: true,
            } as CustomOptions
          }
        />

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
      <StatusBar backgroundColor={colors.black[100]} style="light" />
    </>
  )
}
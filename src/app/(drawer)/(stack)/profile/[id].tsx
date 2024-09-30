import { Follow, UserProfile } from "@/api/@types/models";
import { isFollower } from "@/api/social/follow/read-follow";
import { getProfileUser } from "@/api/social/profile/get-profile-user";
import ProfileDetails from "@/components/profile/profile-details";
import Loader from "@/components/ui/loader";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Profile() {
  const route = useRoute();
  const id = (route.params as { id: number })?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({} as UserProfile);
  const [isFollow, setIsFollow] = useState<Follow | undefined>();
  const { user } = useAuth();

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await getProfileUser(id);
      setProfile(data);
      const isFollowData = await isFollower(id);
      setIsFollow(isFollowData);


      console.log('buscou os dados ', isFollowData)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro as informaçōes desse perfil", "Tente novamente mais tarde.'
      });

      router.push('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    await fetchProfileData();
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);


  return (
    <>
      <SafeAreaView className="bg-black-100" style={{ flex: 1 }}>
        {profile.info && (
          <ProfileDetails 
            profile={profile} 
            isLoggerUser={user?.id == id} 
            isFollow={isFollow} 
            onUpdateProfile={updateProfile} 
          />
        )}
      </SafeAreaView>
      <Loader isLoading={isLoading} />
    </>
  )
}
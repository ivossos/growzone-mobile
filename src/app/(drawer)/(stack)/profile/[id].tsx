import { Follow, UserProfile } from "@/api/@types/models";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { isFollower } from "@/api/social/follow/read-follow";
import { getProfileUser } from "@/api/social/profile/get-profile-user";
import Loader from "@/components/ui/loader";
import { AvatarSection, FollowButton, Header, Metrics, ProfileInfo, TabProfileSection } from "@/components/ui/profile";
import TabProfile from "@/components/ui/tab-profile";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { useAuth } from "@/hooks/use-auth";
import { formatDateToMonthYear } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, ScrollView, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Profile: React.FC = () => {
  const route = useRoute();
  const params = (route.params as { id: number, openReview: string }) || {}
  const { id, openReview } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [follow, setFollow] = useState<Follow | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile>({} as UserProfile);
  const { user } = useAuth();
  const { openBottomSheet } = useBottomSheetContext();

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [profileData, followData] = await Promise.all([
        getProfileUser(id),
        isFollower(id),
      ]);
      setProfile(profileData);
      setFollow(followData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Aconteceu um erro ao carregar as informações desse perfil. Tente novamente mais tarde.",
      });
      router.push("/home");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push({ pathname: "/edit-profile" });
  };

  const handleReviewsPress = () => {
    openBottomSheet({ type: "reviews-profile", userId: profile.info.id });
  };

  const handleRateProfilePress = () => {
    openBottomSheet({
      type: "rate-profile",
      userId: profile.info.id,
      callbackFn: fetchProfileData,
    });
  };

  const handleFollowPress = async () => {
    if (isLoadingFollow) return;
    setIsLoadingFollow(true);
    try {
      if (follow?.is_active) {
        await deleteFollow(profile.info.id);
        setFollow(undefined);
      } else {
        const newFollow = await createFollow(profile.info.id);
        setFollow(newFollow);
      }
      await fetchProfileData();
    } catch (error) {
      console.error("erro on handleFollower", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Aconteceu um erro ao realizar essa ação. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const renderHeader = () => (
    <View>
      <Header onBack={() => router.back()} />
          <AvatarSection
            imageUri={image?.image}
            coverUri={cover?.cover}
            isLoggerUser={user?.id === id}
            onEditProfile={handleEditProfile}
          />
          <ProfileInfo name={info?.name} username={info?.username} biography={info?.biography} category={info?.category}/>
          <Metrics
            followers={metric?.followers}
            following={metric?.following}
            memberSince={formatDateToMonthYear(info?.created_at)}
            socialCount={metric?.social_count}
            reelCount={metric?.reel_count}
            averageReview={metric?.average_review}
            onReviewsPress={handleReviewsPress}
          />
          {user && user.id != id && (
            <View className="flex flex-row gap-2 px-6 mt-6">
              <FollowButton isFollowing={!!follow} isLoading={isLoadingFollow} onFollowPress={handleFollowPress} />
              <TouchableOpacity
                onPress={handleRateProfilePress}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.black[70],
                  borderRadius: 100,
                  padding: 4,
                  height: 40,
                  width: 40,
                }}
              >
                <Ellipsis size={16} color={colors.black[70]} />
              </TouchableOpacity>
            </View>
          )}
    </View>
  )

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  if (!profile) return null;

  const { cover, image, info, metric } = profile;
 
  return (
    <>
      <SafeAreaView className="bg-black-100" style={{ flex: 1 }}>      
        <FlatList
          data={[]}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="bg-black-100"
          ListHeaderComponent={renderHeader}
          ListFooterComponent={ <View style={{ width: '100%', height: Dimensions.get('window').height - 100}}>
          <TabProfile userId={id} />
        </View>}
          keyExtractor={() => "profile"}
        />
      </SafeAreaView>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default Profile;

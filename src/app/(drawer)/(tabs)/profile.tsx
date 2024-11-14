import { SafeAreaView } from "react-native-safe-area-context";
import UserProfileScreen from "@/components/ui/profile/user-profile-screen";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/ui/my-profile/header";

function ProfileFeed() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={{flex: 1 }} edges={['top']}>
      <UserProfileScreen userId={user.id} Header={() => <Header />} />
    </SafeAreaView>
  );
}


export default ProfileFeed;

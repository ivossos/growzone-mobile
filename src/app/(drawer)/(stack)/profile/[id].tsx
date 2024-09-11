import ProfileDetails from "@/components/profile/profile-details";
import TabProfile from "@/components/ui/tab-profile";
import { useNavigation } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView className="bg-black-100" style={{ flex: 1 }}>
       <ProfileDetails />
    </SafeAreaView>
  )
}
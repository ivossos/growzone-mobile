import React, { memo, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import UserProfileScreen from "@/components/ui/profile/user-profile-screen";

import { colors } from "@/styles/colors";
import { Header } from "@/components/ui/profile";

const Profile: React.FC = () => {
  const globalParams = useLocalSearchParams();
  const { id } = (globalParams as { id: string; openReview: string }) || {};

  const userId = id ? Number(id) : 0;

  const renderReader = () => <Header onBack={() => router.push(`/profile?id=${userId}`)} />;

  return (
    <>
      <SafeAreaView
        className="bg-black-100"
        style={{ backgroundColor: colors.black[100], flex: 1 }}
      >
        <UserProfileScreen userId={userId} Header={renderReader} />
      </SafeAreaView>
    </>
  );
};

export default memo(Profile);

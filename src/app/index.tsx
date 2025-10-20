import { Image, View, TouchableOpacity, Text } from "react-native";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Splash() {
  const { user, isLoadingUserStorage } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<"/home" | "/age-decision">("/age-decision");

  useEffect(() => {
    // Wait for auth to load, then decide where to redirect
    if (!isLoadingUserStorage) {
      console.log('🏠 Splash - Auth loaded, checking user state:', {
        hasUser: !!user?.id,
        userId: user?.id,
      });

      const timer = setTimeout(() => {
        if (user?.id) {
          console.log('➡️ User logged in, redirecting to home');
          setRedirectPath("/home");
        } else {
          console.log('➡️ No user, redirecting to age-decision');
          setRedirectPath("/age-decision");
        }
        setShouldRedirect(true);
      }, 1500); // Show splash for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [user?.id, isLoadingUserStorage]);

  // If ready to redirect, use Redirect component
  if (shouldRedirect) {
    return <Redirect href={redirectPath} />;
  }

  // Show splash screen while loading
  return (
    <View className="flex justify-center items-center bg-brand-black h-full">
      <Image
        className="w-[214px] h-[30px]"
        resizeMode="contain"
        source={require("@/assets/images/logo-green.png")}
      />

      {/* DEV: Test Chat Button - Only show when not loading */}
      {!isLoadingUserStorage && (
        <TouchableOpacity
          onPress={() => {
            setShouldRedirect(true);
            setRedirectPath("/test-chat" as any);
          }}
          style={{
            position: "absolute",
            bottom: 50,
            backgroundColor: "#2CC420",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#0D0D0D", fontSize: 14, fontWeight: "600" }}>
            🧪 Test Chat UI
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

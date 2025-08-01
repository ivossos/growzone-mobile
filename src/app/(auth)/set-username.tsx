import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight } from "lucide-react-native";

import { setAppleUsername } from "@/api/auth/apple-login";
import { showSuccess, showError } from "@/utils/toast";

import Button from "@/components/ui/button";
import { colors } from "@/styles/colors";

const SetUsername = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSetUsername = async () => {
    if (!username.trim()) {
      showError("Username is required");
      return;
    }

    if (username.length < 3) {
      showError("Username must be at least 3 characters");
      return;
    }

    if (username.length > 20) {
      showError("Username must be less than 20 characters");
      return;
    }

    // Validação básica para formato do username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      showError("Username can only contain letters, numbers, and underscores");
      return;
    }

    try {
      setIsLoading(true);

      await setAppleUsername({ username: username.trim() });

      showSuccess("Username set successfully!");
      router.replace("/home");
    } catch (error: any) {
      const message = error?.message || "Failed to set username. Try again.";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={["top"]}>
        <View className="bg-black-100 w-full flex items-center justify-center h-full px-6">
          <View className="flex items-center justify-center gap-6 my-10">
            <Text className="text-3xl font-semibold text-white text-center">
              Choose your username
            </Text>
            <Text className="text-lg font-regular text-black-30 text-center">
              This will be your unique identifier in the Growzone community
            </Text>
          </View>

          <View className="w-full gap-4">
            <View className="gap-2">
              <Text className="text-white text-lg font-medium">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={colors.black["30"]}
                className="bg-black-90 rounded-lg min-h-[56px] px-4 text-white text-lg"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                maxLength={20}
              />
            </View>

            <View className="gap-2">
              <Text className="text-black-30 text-sm">
                • 3-20 characters
              </Text>
              <Text className="text-black-30 text-sm">
                • Letters, numbers, and underscores only
              </Text>
              <Text className="text-black-30 text-sm">
                • Must be unique
              </Text>
            </View>
          </View>

          <View className="w-full mt-8">
            <Button
              variant="default"
              handlePress={handleSetUsername}
              title="Continue"
              rightIcon={ArrowRight}
              isDisabled={isLoading || !username.trim()}
            />
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default SetUsername; 
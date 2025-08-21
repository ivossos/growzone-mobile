import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  Animated,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import { BlurView } from "expo-blur";
import { ArrowLeft, Copy, ChevronRight } from "lucide-react-native";

import { screens } from "@/constants/screens";
import ReportModal from "@/components/ui/report-modal";
import { useInstagramStatus } from "@/hooks/useInstagramStatus";
import { useInstagramDisconnect } from "@/hooks/useInstagramDisconnect";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { colors } from "@/styles/colors";
import { authApi } from "@/lib/axios";

export default function GrowsyncDisconnect() {
  const navigation = useNavigation();
  const { disconnectInstagram } = useInstagramDisconnect();
  const { data, loading, error, refetch } = useInstagramStatus();
  const { user, token } = useAuth();
  const { title, Icon } = screens["growsync"];

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const translateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    setIsConnected(!!data?.is_connected);
  }, [data]);

  useEffect(() => {
    if (showModal) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, translateY]);

  function handleBack() {
    navigation.goBack();
  }

  function handleImport() {
    router.push("/growsync/import-post");
  }

  function toggleSwitch() {
    const next = !isConnected;
    if (!next) {
      setShowModal(true);
    } else {
      setIsConnected(true);
    }
  }

  async function handleConnectInstagram() {
    try {
      const res = await authApi.get("/instagram/oauth-url", {
        params: { user_id: user.id },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const { authorization_url } = res.data || {};
      if (!authorization_url) throw new Error("authorization_url not provided");

      showSuccess("Redirecting to Instagram...");
      Linking.openURL(authorization_url);
    } catch (err: any) {
      showError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to start Instagram connection"
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100 px-6">
      <Modal
        transparent
        animationType="none"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView
          intensity={80}
          tint="dark"
          className="flex-1 justify-center items-center px-6 absolute inset-0"
        >
          <Animated.View
            style={{
              transform: [{ translateY }],
              width: "100%",
              maxWidth: 360,
            }}
          >
            <ReportModal
              title="Are you sure you want to disconnect?"
              description="By selecting this option your Instagram account will be disconnected. Are you sure you want to disconnect?"
              primaryLabel="Cancel"
              secondaryLabel="Disconnect"
              onPrimary={() => {
                setShowModal(false);
                setIsConnected(true);
              }}
              onSecondary={async () => {
                try {
                  await disconnectInstagram();
                  await refetch();
                  setIsConnected(false);
                  showSuccess("Instagram account disconnected successfully");
                } catch (e) {
                  showError("Failed to disconnect. Please try again.");
                } finally {
                  setShowModal(false);
                }
              }}
            />
          </Animated.View>
        </BlurView>
      </Modal>

      <View className="flex flex-row items-center gap-4 h-[72px] border-b-[1px] border-black-80">
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
        </TouchableOpacity>
        <View className="flex flex-row items-center gap-2">
          <Icon width={20} height={20} />
          <Text className="text-white text-base font-semibold">{title}</Text>
        </View>
      </View>

      <View className="mt-6">
        <View>
          <View className="items-center mt-8 mb-6">
            <View className="w-24 h-24 rounded-full bg-black-80 justify-center items-center overflow-hidden border border-black-80">
              <Image
                source={require("@/assets/images/adaptive-icon.png")}
                style={{ width: 86, height: 86 }}
                resizeMode="cover"
              />
            </View>
          </View>

          {loading ? (
            <Text className="text-white text-center font-medium">
              Checking connection...
            </Text>
          ) : data?.is_connected ? (
            <>
              <Text className="text-white text-center font-bold mb-3">
                @{data.instagram_username}
              </Text>
              <Text className="text-black-50 text-center font-medium">
                Your Instagram is connected to Growzone
              </Text>
            </>
          ) : (
            <>
              <Text className="text-white text-center font-bold mb-3">
                No account connected
              </Text>
              <TouchableOpacity
                onPress={handleConnectInstagram}
                disabled={loading}
                className={`mt-3 py-3 px-6 rounded-lg self-center ${loading ? "bg-black-60" : "bg-primary"
                  }`}
              >
                <Text className="text-black font-bold text-base">
                  {loading ? "Loading..." : "Connect with Instagram"}
                </Text>
              </TouchableOpacity>
              {error ? (
                <Text className="text-center text-red-400 mt-2">{error}</Text>
              ) : null}
            </>
          )}
        </View>

        <TouchableOpacity className="mt-9" onPress={handleImport}>
          <View className="flex flex-row items-center justify-between px-4 py-4 bg-black rounded-lg">
            <View className="flex flex-row items-center gap-4">
              <Copy size={24} color="white" />
              <Text className="text-white text-base font-medium">Post</Text>
            </View>
            <ChevronRight
              className="rotate-180"
              color={colors.black[60]}
              size={16}
            />
          </View>
        </TouchableOpacity>

        <View className="flex flex-row items-center justify-between mt-9 px-4">
          <Text className="text-white text-base font-medium">
            Disconnect Instagram account
          </Text>
          <Switch
            value={isConnected}
            onValueChange={toggleSwitch}
            trackColor={{ false: colors.black[70], true: "#32CD32" }}
            thumbColor={"#ffffff"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

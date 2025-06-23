import { useState, useCallback, useRef, useEffect  } from "react";
import { View, Text, TouchableOpacity, Switch, Image, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Copy, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useNavigation } from "expo-router";
import { screens } from "@/constants/screens";
import ReportModal from "@/components/ui/report-modal";
import { colors } from "@/styles/colors";
import { BlurView } from "expo-blur";
import { Animated } from "react-native";


export default function GrowsyncDisconnect() {
  const navigation = useNavigation();
  const { title, Icon } = screens["growsync"];
  const [isConnected, setIsConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingDisconnect, setPendingDisconnect] = useState(false);
  const translateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      setIsConnected(true);
    }, [])
  );

  useEffect(() => {
  if (showModal) {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}, [showModal]);

  function handleBack() {
    navigation.goBack();
  }

  function handleImport() {
    router.push("/growsync/import-post");
  }

 function toggleSwitch() {
  const newValue = !isConnected;

  if (!newValue) {
    setPendingDisconnect(true);
    setShowModal(true);
  } else {
    setIsConnected(true);
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
                setPendingDisconnect(false);
                setIsConnected(true);
              }}
              onSecondary={() => {
                setShowModal(false);
                setPendingDisconnect(false);
                setIsConnected(false);
                setTimeout(() => {
                  navigation.goBack();
                }, 300);
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
          <Text className="text-white text-center font-bold mb-3">
            @growzone.co
          </Text>
          <Text className="text-black-50 text-center font-medium">
            Your Instagram is connected to Growzone
          </Text>
        </View>
        <TouchableOpacity
          className="mt-9"
          onPress={handleImport}
        >
          <View className="flex flex-row items-center justify-between px-4 py-4 bg-black rounded-lg">
            <View className="flex flex-row items-center gap-4">
              <Copy size={24} color="white" />
              <Text className="text-white text-base font-medium">Post</Text>
            </View>
            <ChevronRight className="rotate-180" color={colors.black[60]} size={16} />
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
function useReff(arg0: any) {
  throw new Error("Function not implemented.");
}


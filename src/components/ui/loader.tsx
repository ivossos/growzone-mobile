import { View, ActivityIndicator, Dimensions, Platform } from "react-native";
import { colors } from "@/styles/colors";

const Loader = ({ isLoading }: { isLoading: boolean }) => {
  const osName = Platform.OS;
  const screenHeight = Dimensions.get("screen").height;

  if (!isLoading) return null;

  return (
    <View
      className="absolute flex justify-center items-center w-full h-full bg-black-100/60 z-50"
      style={{
        height: screenHeight,
      }}
    >
      <ActivityIndicator
        animating={isLoading}
        color={colors.brand.green}
        size={osName === "ios" ? "large" : 50}
      />
    </View>
  );
};

export default Loader;

import { View, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small.svg";
import { colors } from "@/styles/colors";
import { memo } from "react";

type HeaderProps = {
  onBack: () => void;
};

const MemoizedHeader = ({ onBack }: HeaderProps) => {
  return (
    <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80 bg-black-100">
      <TouchableOpacity
        className="p-2 rounded-lg border border-black-80"
        onPress={onBack}
      >
        <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
      </TouchableOpacity>
      <LogoIcon width={102} height={30} />
    </View>
  );
}

export const Header = memo(MemoizedHeader);

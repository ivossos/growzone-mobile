import { colors } from "@/styles/colors";
import clsx from "clsx";
import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface DrawerButtonProps extends TouchableOpacityProps {
  title: string;
  isDivider?: boolean;
  Icon: React.ComponentType<SvgProps>;
}

export function DrawerButton({title, isDivider, Icon, ...props}: DrawerButtonProps) {
  return (
      <TouchableOpacity 
        className={clsx("flex flex-row justify-between items-center gap-2 px-6 h-[72px]", {
          "border-b-[1px] border-black-80": isDivider
        })}
        {...props}
      >
        <View className="flex flex-row items-center gap-2">
          <Icon width={24} height={24} color={colors.brand.green}/>
          <Text className="text-white text-base font-semibold">
            {title}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.black[70]} />
      </TouchableOpacity>
  )
}
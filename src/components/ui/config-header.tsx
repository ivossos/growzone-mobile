import { View, Text } from "react-native";
import { SvgProps } from "react-native-svg";

interface ConfigHeaderProps {
  title?: string;
  description?: string;
  Icon?: React.ComponentType<SvgProps>;
}

export default function ConfigHeader({ title, description, Icon }: ConfigHeaderProps) {
  return (
    <View className="flex flex-col gap-2">
      <View className="flex flex-row items-center gap-2">
        {Icon && <Icon width={32} height={32} />}
        <Text className="text-white text-lg font-semibold">{title}</Text>
      </View>
      <Text className="text-brand-grey text-sm font-regular">{description}</Text>
    </View>
  );
}

import { Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface Props {
  title: string;
  description: string;
  Icon: React.ComponentType<SvgProps>;
}

export default function ConfigHeader({ title, description, Icon }: Props) {
  return (
    <View className="flex flex-col gap-2">
      <Icon width={32} height={32} />
      <Text className="text-white text-lg font-medium">{title}</Text>
      <Text className="text-brand-grey text-sm font-regular">{description}</Text>
    </View>
  )
}
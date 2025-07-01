import { View, Text, TouchableOpacity, Image } from "react-native";
import { Check, Trash2, AlertCircle, Loader2 } from "lucide-react-native";

export interface ImportItemCardProps {
  title: string;
  date: string;
  thumbnail?: string;
  selected?: boolean;
  status?: "idle" | "importing" | "imported" | "failed";
  onSelect?: () => void;
  onRemove?: () => void;
}

export default function ImportItemCard({
  title,
  date,
  thumbnail,
  selected = false,
  status = "idle",
  onSelect,
  onRemove,
}: ImportItemCardProps) {
  return (
    <TouchableOpacity
      onPress={status === "idle" ? onSelect : undefined}
      activeOpacity={0.9}
      className="flex-row items-center justify-between px-4 py-3 bg-black-90 rounded-lg mb-3"
    >
      <View className="flex-row items-center gap-4">
        <Image
          source={thumbnail ? { uri: thumbnail } : require("@/assets/images/photo.png")}
          className="w-12 h-12 rounded-md"
          resizeMode="cover"
        />
        <View>
          <Text className="text-white text-base font-medium">{title}</Text>
          <Text className="text-black-50 text-sm mt-1">{date}</Text>
        </View>
      </View>

      {status === "imported" && (
        <View className="flex-row items-center gap-2">
          <Text className="text-green-500 font-medium">Imported</Text>
          <TouchableOpacity onPress={onRemove}>
            <Trash2 size={18} color="red" />
          </TouchableOpacity>
        </View>
      )}

      {status === "failed" && (
        <View className="flex-row items-center gap-2">
          <Text className="text-red-500 font-medium">Failed</Text>
          <AlertCircle size={18} color="red" />
        </View>
      )}

      {status === "importing" && (
        <Loader2 size={18} color="white" className="animate-spin" />
      )}

      {status === "idle" && (
        selected ? (
          <View className="w-6 h-6 bg-[#32CD32] rounded-full items-center justify-center">
            <Check size={16} color="black" />
          </View>
        ) : (
          <View className="w-6 h-6 rounded-full border border-black-60" />
        )
      )}
    </TouchableOpacity>
  );
}

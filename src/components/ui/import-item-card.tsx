import { View, Text, TouchableOpacity, Image } from "react-native";
import { Check, Trash2, AlertCircle, Loader2, Video, Image as ImageIcon, Layers } from "lucide-react-native";

export interface ImportItemCardProps {
  title?: string;
  date?: string;
  thumbnail?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  selected?: boolean;
  status?: "idle" | "importing" | "imported" | "failed";
  onSelect?: () => void;
  onRemove?: () => void;
}

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function getMediaTypeIcon(type?: string) {
  if (type === "VIDEO") return <Video size={16} color="#32CD32" />;
  if (type === "CAROUSEL_ALBUM") return <Layers size={16} color="#32CD32" />;
  return <ImageIcon size={16} color="#32CD32" />;
}

export default function ImportItemCard({
  title,
  date,
  thumbnail,
  mediaType,
  selected = false,
  status = "idle",
  onSelect,
  onRemove,
}: ImportItemCardProps) {
  return (
    <TouchableOpacity
      onPress={status === "idle" ? onSelect : undefined}
      activeOpacity={0.9}
      className="flex-row items-center justify-between px-4 bg-black-90 rounded-lg mb-3 h-20"
      testID="import-item-card"
    >
      <View className="flex-row items-center gap-4 flex-1 min-w-0">
        <Image
          source={thumbnail ? { uri: thumbnail } : require("@/assets/images/photo.png")}
          className="w-12 h-12 rounded-md"
          resizeMode="cover"
        />

        <View style={{ flex: 1, minWidth: 0 }}>
          <View className="flex-row items-center gap-1">
            {getMediaTypeIcon(mediaType)}
            <Text
              className="text-white text-base font-medium ml-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title?.trim() || "No caption"}
            </Text>
          </View>

          <Text
            className="text-black-50 text-xs mt-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatDate(date)}
          </Text>
        </View>
      </View>

      <View className="ml-3 items-end justify-center" style={{ width: 28 }}>
        {status === "imported" && (
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Trash2 size={18} color="red" />
          </TouchableOpacity>
        )}

        {status === "failed" && <AlertCircle size={18} color="red" />}

        {status === "importing" && <Loader2 size={18} color="white" className="animate-spin" />}

        {status === "idle" &&
          (selected ? (
            <View className="w-6 h-6 bg-[#32CD32] rounded-full items-center justify-center">
              <Check size={16} color="black" />
            </View>
          ) : (
            <View className="w-6 h-6 rounded-full border border-black-60" />
          ))}
      </View>
    </TouchableOpacity>
  );
}

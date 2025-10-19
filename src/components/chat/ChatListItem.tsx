import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Pin, BellOff } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Conversation } from "@/api/@types/chat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  conversation,
  onPress,
}) => {
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return `${diffInMinutes}min`;
      }

      if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours}h`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    } catch {
      return "";
    }
  };

  const getMessagePreview = () => {
    if (conversation.typing) {
      return (
        <Text className="text-primary italic text-xs">digitando...</Text>
      );
    }

    const type = conversation.lastMessage.type;
    if (type === "audio") return "Áudio";
    if (type === "image") return "Imagem";
    if (type === "video") return "Vídeo";
    if (type === "file") return "Arquivo";

    return conversation.lastMessage.text;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row px-3 py-3"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="mr-3">
        <Image
          source={{ uri: conversation.userAvatar || "https://i.pravatar.cc/150" }}
          className="w-10 h-10 rounded-full"
        />
        {conversation.online && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-black-100 rounded-full" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-white font-medium text-xs"
            numberOfLines={1}
            style={{ fontSize: 12, fontWeight: "500" }}
          >
            {conversation.userName}
          </Text>
          <Text
            className="text-black-70 text-xs ml-2"
            style={{ fontSize: 12 }}
          >
            {formatTime(conversation.lastMessage.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            className={`flex-1 text-xs ${
              conversation.unreadCount > 0 ? "text-white" : "text-black-30"
            }`}
            numberOfLines={1}
            style={{ fontSize: 12 }}
          >
            {getMessagePreview()}
          </Text>

          {/* Right indicators */}
          <View className="flex-row items-center ml-2">
            {conversation.pinned && (
              <Pin size={12} color={colors.black[60]} fill={colors.black[60]} />
            )}
            {conversation.muted && (
              <BellOff size={12} color={colors.black[60]} className="ml-1" />
            )}
            {conversation.unreadCount > 0 && (
              <View
                className="bg-primary rounded-full px-2 py-0.5 ml-1"
                style={{ minWidth: 20, height: 14, alignItems: "center", justifyContent: "center" }}
              >
                <Text
                  className="text-white text-xs font-bold"
                  style={{ fontSize: 10 }}
                >
                  {conversation.unreadCount > 99 ? "+99" : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

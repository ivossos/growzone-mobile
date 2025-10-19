import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Play, Volume2 } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Message } from "@/api/@types/chat";

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  showAvatar?: boolean;
  onAudioPlay?: () => void;
  onImagePress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMyMessage,
  showAvatar = true,
  onAudioPlay,
  onImagePress,
}) => {
  const formatTime = (date: Date | number) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatAudioDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderMessageContent = () => {
    // Reply message
    if (message.replyTo) {
      return (
        <View className={`rounded ${isMyMessage ? "bg-green-darker-80" : "bg-black-90"}`}>
          {/* Reply quote */}
          <View className="bg-black-80 rounded-t px-2 py-2 mb-1">
            <Text className="text-black-30 text-xs font-medium" style={{ fontSize: 12 }}>
              {message.replyTo.user.name}
            </Text>
            <Text className="text-white text-xs" numberOfLines={2} style={{ fontSize: 12 }}>
              {message.replyTo.text}
            </Text>
          </View>

          {/* Reply content */}
          <View className="px-2 pb-2">
            {message.text && (
              <Text className="text-white text-xs" style={{ fontSize: 12 }}>
                {message.text}
              </Text>
            )}
            {renderMetadata()}
          </View>
        </View>
      );
    }

    // Audio message
    if (message.audio) {
      return (
        <View className={`rounded px-2 py-2 ${isMyMessage ? "bg-green-darker-80" : "bg-black-90"}`}>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onAudioPlay}
              className="w-6 h-6 rounded-full bg-white items-center justify-center mr-2"
            >
              <Play size={12} color={colors.black[100]} fill={colors.black[100]} />
            </TouchableOpacity>

            {/* Waveform placeholder */}
            <View className="flex-1 flex-row items-center h-5 mx-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  className="bg-white mx-0.5"
                  style={{
                    width: 2,
                    height: Math.random() * 20 + 4,
                    borderRadius: 1,
                  }}
                />
              ))}
            </View>

            <Text className="text-red-500 text-xs font-medium" style={{ fontSize: 12 }}>
              {formatAudioDuration(message.audio.duration)}
            </Text>

            <Volume2 size={14} color={colors.brand.white} className="ml-2" />
          </View>
          {renderMetadata()}
        </View>
      );
    }

    // Image message
    if (message.image) {
      return (
        <View className={`rounded overflow-hidden ${isMyMessage ? "bg-green-darker-80" : "bg-black-90"}`}>
          <TouchableOpacity onPress={onImagePress}>
            <Image
              source={{ uri: message.image }}
              className="w-40 h-40"
              resizeMode="cover"
            />
          </TouchableOpacity>
          {message.text && (
            <View className="px-2 py-2">
              <Text className="text-white text-xs" style={{ fontSize: 12 }}>
                {message.text}
              </Text>
            </View>
          )}
          {renderMetadata()}
        </View>
      );
    }

    // Text message
    return (
      <View className={`rounded px-2 py-2 ${isMyMessage ? "bg-green-darker-80" : "bg-black-90"}`}>
        {message.text && (
          <Text className="text-white text-xs" style={{ fontSize: 12, fontWeight: "500" }}>
            {message.text}
          </Text>
        )}
        {renderMetadata()}
      </View>
    );
  };

  const renderMetadata = () => (
    <View className="flex-row items-center justify-between mt-1">
      <Text className="text-black-70 text-xs" style={{ fontSize: 12 }}>
        {formatTime(message.createdAt)}
      </Text>
      {isMyMessage && (
        <View className="flex-row ml-2">
          {/* Read status - double checkmarks */}
          {message.read && (
            <View className="flex-row">
              <Text className="text-primary" style={{ fontSize: 10 }}>✓</Text>
              <Text className="text-primary -ml-1" style={{ fontSize: 10 }}>✓</Text>
            </View>
          )}
          {/* Delivered status - single checkmark */}
          {!message.read && message.sent && (
            <Text className="text-black-70" style={{ fontSize: 10 }}>✓</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className={`flex-row mb-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
      {!isMyMessage && showAvatar && (
        <Image
          source={{ uri: message.user.avatar || "https://i.pravatar.cc/150" }}
          className="w-5 h-5 rounded-full mr-2"
        />
      )}

      <View className={`max-w-[80%] ${isMyMessage ? "items-end" : "items-start"}`}>
        {!isMyMessage && (
          <Text className="text-white text-xs font-semibold mb-1 px-2" style={{ fontSize: 12 }}>
            {message.user.name}
          </Text>
        )}
        {renderMessageContent()}
      </View>

      {isMyMessage && showAvatar && (
        <Image
          source={{ uri: message.user.avatar || "https://i.pravatar.cc/150" }}
          className="w-6 h-6 rounded-full ml-2"
        />
      )}
    </View>
  );
};

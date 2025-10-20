import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { ImageIcon, Smile, Send, Mic, Camera } from "lucide-react-native";
import { colors } from "@/styles/colors";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onImagePick?: () => void;
  onEmojiPick?: () => void;
  onVoiceRecord?: () => void;
  onCameraOpen?: () => void;
  userAvatar?: string;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onImagePick,
  onEmojiPick,
  onVoiceRecord,
  onCameraOpen,
  userAvatar,
  placeholder = "Escreva aqui..",
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <View className="bg-black-100 px-4 py-4 border-t border-black-90">
      <View className="flex-row items-center">
        {/* User Avatar */}
        <Image
          source={{ uri: userAvatar || "https://i.pravatar.cc/150" }}
          className="w-10 h-10 rounded-full mr-3"
        />

        {/* Input Container */}
        <View className="flex-1 flex-row items-center bg-black-90 rounded-lg px-3 py-2 mr-3">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={colors.black[30]}
            className="flex-1 text-white text-sm"
            style={{ fontSize: 14, maxHeight: 100 }}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />

          {/* Input Icons */}
          <View className="flex-row items-center ml-2">
            <TouchableOpacity onPress={onImagePick} className="mr-2">
              <ImageIcon size={16} color={colors.brand.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onEmojiPick}>
              <Smile size={16} color={colors.brand.white} />
            </TouchableOpacity>

            {message.trim() && (
              <TouchableOpacity onPress={handleSend} className="ml-2">
                <Send size={18} color={colors.brand.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={onVoiceRecord}
            className="w-10 h-10 rounded-full bg-black-90 items-center justify-center mr-2"
          >
            <Mic size={20} color={colors.brand.white} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCameraOpen}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.green.darker[80] }}
          >
            <Camera size={20} color={colors.brand.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

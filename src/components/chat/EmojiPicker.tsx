/**
 * Emoji Picker Component
 * Simple emoji selector for chat messages
 */

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  "Frequentes": [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
    "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
    "❤️", "🔥", "👍", "👎", "👏", "🙌", "💪", "🎉",
  ],
  "Emoji & Pessoas": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
    "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
    "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
    "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
    "🤢", "🤮", "🤧", "🥵", "🥶", "😶‍🌫️", "😵", "😵‍💫",
    "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟",
  ],
  "Animais & Natureza": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
    "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺",
    "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞",
    "🌱", "🌿", "🍀", "🌾", "🌵", "🌴", "🌳", "🌲",
    "🌸", "🌺", "🌻", "🌹", "🌷", "💐", "🌼", "🌈",
  ],
  "Comida & Bebida": [
    "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
    "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆",
    "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄",
    "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨",
    "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩",
    "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙",
    "🌮", "🌯", "🥗", "🥘", "🍝", "🍜", "🍲", "🍱",
    "🍛", "🍣", "🍤", "🍙", "🍚", "🍘", "🍥", "🍡",
  ],
  "Atividades": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
    "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏",
    "🥊", "🎯", "🎮", "🕹️", "🎲", "🎰", "🎳", "🎭",
    "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷",
    "🎺", "🎸", "🪕", "🎻", "🎲", "🎯", "🎪", "🎟️",
  ],
  "Viagens": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
    "🚒", "🚐", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺",
    "🚲", "🛴", "🛹", "🚏", "🛤️", "⛽", "🚨", "🚥",
    "✈️", "🛩️", "🚁", "🚂", "🚃", "🚄", "🚅", "🚆",
    "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌",
    "🚍", "🚎", "🚐", "🚑", "🚒", "🚓", "🚔", "🚕",
  ],
  "Objetos": [
    "⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️",
    "🕹️", "💽", "💾", "💿", "📀", "📼", "📷", "📸",
    "📹", "🎥", "📽️", "📺", "📻", "📡", "⏰", "⏱️",
    "⏲️", "⏳", "⌛", "📡", "🔋", "🔌", "💡", "🔦",
    "💰", "💵", "💴", "💶", "💷", "💳", "💎", "⚖️",
    "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🗜️",
  ],
  "Símbolos": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️",
    "✡️", "🔯", "🕎", "☯️", "☦️", "⛎", "♈", "♉",
    "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑",
    "⭐", "🌟", "💫", "✨", "🔥", "💥", "☀️", "🌤️",
    "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️",
  ],
  "Bandeiras": [
    "🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏴‍☠️", "🇦🇫", "🇦🇽",
    "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬",
    "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭",
    "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹",
    "🇧🇷", "🇮🇴", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇰🇭",
  ],
};

export function EmojiPicker({ visible, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Frequentes");
  const [searchQuery, setSearchQuery] = useState("");

  const handleEmojiPress = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-black-90 rounded-t-3xl" style={{ height: "60%" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-black-80">
            <Text className="text-white text-lg font-semibold">Emojis</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.brand.white} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-black-80 rounded-full px-4 py-2">
              <Ionicons name="search" size={20} color={colors.brand.white} opacity={0.5} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar emoji..."
                placeholderTextColor={colors.brand.white + "80"}
                className="flex-1 ml-2 text-white text-base"
              />
            </View>
          </View>

          {/* Categories */}
          {!searchQuery && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 mb-2"
              contentContainerStyle={{ gap: 8 }}
            >
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    activeCategory === category
                      ? "bg-brand-green"
                      : "bg-black-80"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeCategory === category
                        ? "text-black"
                        : "text-white/60"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Emoji Grid */}
          <ScrollView className="flex-1 px-4">
            <View className="flex-row flex-wrap">
              {filteredEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={`${emoji}-${index}`}
                  onPress={() => handleEmojiPress(emoji)}
                  className="w-1/8 aspect-square items-center justify-center p-2"
                  style={{ width: "12.5%" }}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

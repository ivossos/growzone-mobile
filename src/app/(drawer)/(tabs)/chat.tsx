import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Search } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Conversation } from "@/api/@types/chat";
import { mockConversations, delay } from "@/api/chat/mock-data";
import { ChatListItem } from "@/components/chat/ChatListItem";

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      await delay(800); // Simulate API call
      setConversations(mockConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <ChatListItem
      conversation={item}
      onPress={() => router.push(`/(drawer)/chat/${item.id}` as any)}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <MessageCircle size={64} color={colors.black[60]} />
      <Text className="text-white text-xl font-semibold mt-4 text-center">
        Nenhuma conversa ainda
      </Text>
      <Text className="text-neutral-400 text-base mt-2 text-center">
        Comece uma conversa com outros cultivadores
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black-100">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100" edges={["bottom"]}>
      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-black-80">
        <TouchableOpacity
          className="flex-row items-center bg-black-90 rounded-lg px-4 py-3"
          onPress={() => {
            // TODO: Implement search
            console.log("Open search");
          }}
        >
          <Search size={20} color={colors.black[60]} />
          <Text className="text-neutral-400 ml-3 text-base">
            Buscar conversas...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={
          conversations.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-black-80 mx-4" />
        )}
      />
    </SafeAreaView>
  );
}

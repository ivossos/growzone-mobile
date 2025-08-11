import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  ListRenderItemInfo,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useQueryClient } from "@tanstack/react-query";

import { useInstagramMedia, InstagramMediaItem } from "@/hooks/useInstagramMedia";
import { useAuth } from "@/hooks/use-auth";
import { socialDevApi, socialApi } from "@/lib/axios";
import { screens } from "@/constants/screens";
import ImportItemCard from "@/components/ui/import-item-card";
import ReportModal from "@/components/ui/report-modal";
import { colors } from "@/styles/colors";

type Phase = "selecting" | "importing" | "ready" | "publishing";

function groupByMonthAndYear(
  data: InstagramMediaItem[],
  activeTab: "reels" | "posts",
  showOnlySelected: boolean,
  selectedIds: string[]
) {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const filtered = data.filter(
    (item) =>
      ((activeTab === "posts" && item.media_type === "IMAGE") ||
        (activeTab === "reels" && item.media_type === "VIDEO"))
  );

  const visible = showOnlySelected
    ? filtered.filter((item) => selectedIds.includes(item.id))
    : filtered;

  const groups: Record<string, InstagramMediaItem[]> = {};
  visible.forEach((item) => {
    const date = new Date(item.timestamp);
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return Object.entries(groups).map(([title, groupData]) => ({
    title,
    data: groupData,
  }));
}

const MAX_SELECTION = 20;

export default function ImportPost() {
  const { title, Icon } = screens["growsync"];
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"reels" | "posts">("posts");
  const [itemStatus, setItemStatus] = useState<Record<string, "idle" | "importing" | "imported" | "failed">>({});
  const publishedIdsRef = useRef<string[]>([]);
  const [selectedReelsIds, setSelectedReelsIds] = useState<string[]>([]);
  const [selectedPostsIds, setSelectedPostsIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<"reels" | "posts" | null>(null);
  const [phase, setPhase] = useState<Phase>("selecting");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;

  const { items, loading, fetchMore, hasMore, error, refresh, importedInstagramIds } = useInstagramMedia();
  const { token } = useAuth();

  useEffect(() => {
    publishedIdsRef.current = importedInstagramIds;
  }, [importedInstagramIds]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const selectedIds = activeTab === "reels" ? selectedReelsIds : selectedPostsIds;
  const groupedData = useMemo(
    () => groupByMonthAndYear(items, activeTab, showOnlySelected, selectedIds),
    [items, activeTab, showOnlySelected, selectedIds]
  );

  const hasSelection = selectedIds.length > 0;
  const canSwitchTabs = phase === "selecting" && !hasSelection;

  function handleBack() {
    router.push("/growsync/disconnect");
  }

  function toggleSelection(id: string) {
    if (phase !== "selecting") return;

    if (activeTab === "reels") {
      setSelectedReelsIds((prev) => {
        if (prev.includes(id)) return prev.filter((i) => i !== id);
        if (prev.length >= MAX_SELECTION) {
          Toast.show({
            type: "error",
            text1: "Limite atingido",
            text2: `Você só pode selecionar até ${MAX_SELECTION} itens por importação.`,
          });
          return prev;
        }
        return [...prev, id];
      });
    } else {
      setSelectedPostsIds((prev) => {
        if (prev.includes(id)) return prev.filter((i) => i !== id);
        if (prev.length >= MAX_SELECTION) {
          Toast.show({
            type: "error",
            text1: "Limite atingido",
            text2: `Você só pode selecionar até ${MAX_SELECTION} itens por importação.`,
          });
          return prev;
        }
        return [...prev, id];
      });
    }
  }

  function handleRemove(id: string) {
    if (phase !== "selecting") return;
    setSelectedReelsIds((prev) => prev.filter((i) => i !== id));
    setSelectedPostsIds((prev) => prev.filter((i) => i !== id));
    setItemStatus((prev) => ({ ...prev, [id]: "idle" }));
  }

  async function doImport() {
    setPhase("importing");
    setShowOnlySelected(true);

    setItemStatus((prev) => {
      const updated = { ...prev };
      selectedIds.forEach((id) => (updated[id] = "importing"));
      return updated;
    });

    const headers = { Authorization: `Bearer ${token}` };
    const payload = {
      instagram_media_ids: selectedIds,
      add_instagram_label: true,
    };

    async function tryPost() {
      const attempts = [
        { api: socialDevApi, path: "/instagram/save-posts" },
        { api: socialApi,    path: "/instagram/save-posts" },
      ];
      let lastErr: any;
      for (const { api, path } of attempts) {
        try {
          const res = await api.post(path, payload, { headers });
          return res;
        } catch (e: any) {
          lastErr = e;
          const status = e?.response?.status;
          if (status !== 404 && status !== 405) throw e;
        }
      }
      throw lastErr;
    }

    try {
      const res = await tryPost();

      const importedIds = Array.isArray(res.data?.imported_ids)
        ? (res.data.imported_ids as string[])
        : [...selectedIds];

      const failedIds = selectedIds.filter((id) => !importedIds.includes(id));

      setItemStatus((prev) => {
        const updated = { ...prev };
        importedIds.forEach((id) => (updated[id] = "imported"));
        failedIds.forEach((id) => (updated[id] = "failed"));
        return updated;
      });

      // Após importar, manter visível apenas o que foi selecionado e importado com sucesso
      if (activeTab === "reels") {
        setSelectedReelsIds((prev) => prev.filter((id) => importedIds.includes(id)));
      } else {
        setSelectedPostsIds((prev) => prev.filter((id) => importedIds.includes(id)));
      }

      if (failedIds.length > 0) {
        Toast.show({
          type: "info",
          text1: "Importação parcial",
          text2: `${importedIds.length} importados, ${failedIds.length} falharam.`,
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Importação concluída!",
          text2: `${importedIds.length} posts importados com sucesso.`,
        });
      }

      setPhase("ready");
    } catch (error: any) {
      const partial =
        error?.response?.data?.imported_ids ||
        error?.response?.data?.partial_imported_ids ||
        [];

      const importedIds = Array.isArray(partial) ? (partial as string[]) : [];
      const failedIds = selectedIds.filter((id) => !importedIds.includes(id));

      setItemStatus((prev) => {
        const updated = { ...prev };
        importedIds.forEach((id) => (updated[id] = "imported"));
        failedIds.forEach((id) => (updated[id] = "failed"));
        return updated;
      });

      if (importedIds.length > 0) {
        if (activeTab === "reels") {
          setSelectedReelsIds((prev) => prev.filter((id) => importedIds.includes(id)));
        } else {
          setSelectedPostsIds((prev) => prev.filter((id) => importedIds.includes(id)));
        }
        setPhase("ready");
        Toast.show({
          type: "info",
          text1: "Importação parcial",
          text2: `${importedIds.length} importados, ${failedIds.length} falharam.`,
        });
      } else {
        setPhase("selecting");
        setShowOnlySelected(false);
        Toast.show({
          type: "error",
          text1: "Erro ao importar posts",
          text2:
            error?.response?.data?.detail ||
            error?.message ||
            "Tente novamente.",
        });
      }
    }
  }

  async function doPublish() {
    setPhase("publishing");
    await queryClient.invalidateQueries({ queryKey: ["home-posts"], exact: false });
    router.replace("/home");
  }

  async function handlePrimaryAction() {
    if (phase === "selecting") {
      await doImport();
    } else if (phase === "ready") {
      await doPublish();
    }
  }

  function onRefresh() {
    if (phase !== "selecting") return;
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  }

  useEffect(() => {
    if (showModal) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [showModal]);

  const primaryDisabled =
    (phase === "selecting" && (!hasSelection || loading)) ||
    phase === "importing" ||
    phase === "publishing";

  const primaryLabel =
    phase === "importing"
      ? "Importing..."
      : phase === "ready"
      ? "Publish"
      : phase === "publishing"
      ? "Publishing..."
      : "Import";

  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
        </TouchableOpacity>
        <View className="flex flex-row items-center gap-2">
          <Icon width={20} height={20} />
          <Text className="text-white text-base font-semibold">{title}</Text>
        </View>
      </View>

      <View className="flex-1">
        <View className="mt-6 items-start px-6">
          <Text className="text-white text-xl font-semibold mb-2">
            Imported content
          </Text>
          <Text className="text-white text-sm">
            {phase === "importing"
              ? "Wait for your import to be completed before publishing it on growzone"
              : phase === "ready"
              ? "Review your imported items and publish them to your Growzone"
              : "Select your Instagram posts or reels to share on Growzone"}
          </Text>
        </View>

        <View className="px-6 mt-6">
          <View className="flex-row border-b border-black-80">
            {["posts", "reels"].map((tab) => {
              const isActive = activeTab === tab;
              const isBlocked =
                !canSwitchTabs ||
                (selectedReelsIds.length > 0 && tab === "posts") ||
                (selectedPostsIds.length > 0 && tab === "reels");
              return (
                <TouchableOpacity
                  key={tab}
                  className="flex-1 items-center pb-2"
                  onPress={() => {
                    if (isBlocked) {
                      setPendingTab(tab as "reels" | "posts");
                      setShowModal(true);
                    } else {
                      setActiveTab(tab as "reels" | "posts");
                    }
                  }}
                >
                  <Text
                    className={`text-base font-semibold ${
                      isActive ? "text-white" : "text-black-50"
                    }`}
                  >
                    {tab === "reels" ? "Video" : "Post"}
                  </Text>
                  <View
                    className={`h-[2px] w-full mt-2 ${
                      isActive ? "bg-[#32CD32]" : "bg-transparent"
                    }`}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading && items.length === 0 ? (
          <ActivityIndicator size="large" color="#32CD32" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text className="text-white text-center mt-8">{error}</Text>
        ) : groupedData.length === 0 ? (
          <Text className="text-white text-center mt-8">Nenhum conteúdo encontrado.</Text>
        ) : (
          <SectionList
            sections={groupedData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 120,
            }}
            renderItem={({ item }: ListRenderItemInfo<InstagramMediaItem>) => (
              <ImportItemCard
                key={item.id}
                title={item.caption}
                date={item.timestamp}
                thumbnail={item.media_url}
                mediaType={
                  item.media_type?.toUpperCase?.() as "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
                }
                selected={selectedIds.includes(item.id)}
                status={itemStatus[item.id] || "idle"}
                onSelect={() => toggleSelection(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-white text-sm font-semibold mt-4 mb-2">
                {title}
              </Text>
            )}
            onEndReached={() => {
              if (phase === "selecting" && hasMore && !loading) fetchMore();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#32CD32"
              />
            }
          />
        )}

        <View className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-black-80 bg-black-100">
          <TouchableOpacity
            disabled={primaryDisabled}
            onPress={handlePrimaryAction}
            className={`w-full py-3 rounded-lg items-center justify-center ${
              primaryDisabled ? "bg-[#B6B6B6]" : "bg-[#32CD32]"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                primaryDisabled ? "text-black" : "text-black"
              }`}
            >
              {primaryLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showModal && (
        <BlurView intensity={80} tint="dark" className="flex-1 justify-center items-center px-6 absolute inset-0">
          <Animated.View style={{ transform: [{ translateY }], width: "100%", maxWidth: 360 }}>
            <ReportModal
              title="Tab switch not allowed"
              description={
                phase === "selecting"
                  ? "You can’t switch tabs after selecting content. To choose a different tab, please clear your current selection first."
                  : "You can’t switch tabs while importing or before publishing your selected content."
              }
              primaryLabel="OK"
              onPrimary={() => {
                setShowModal(false);
                setPendingTab(null);
              }}
            />
          </Animated.View>
        </BlurView>
      )}
    </SafeAreaView>
  );
}

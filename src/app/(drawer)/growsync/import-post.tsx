import { useState, useRef, useEffect  } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  ListRenderItemInfo,
  Animated, 
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";

import { screens } from "@/constants/screens";
import ImportItemCard from "@/components/ui/import-item-card";
import ReportModal from "@/components/ui/report-modal";

import { colors } from "@/styles/colors";

interface ImportDataItem {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
  status: "idle" | "importing" | "imported" | "failed";
  type: "reels" | "posts";
}

export default function ImportPost() {
  const { title, Icon } = screens["growsync"];
  const [activeTab, setActiveTab] = useState<"reels" | "posts">("posts");
  const publishedIdsRef = useRef<string[]>([]);
  const [selectedReelsIds, setSelectedReelsIds] = useState<string[]>([]);
  const [selectedPostsIds, setSelectedPostsIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<"reels" | "posts" | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;

  const [data, setData] = useState<ImportDataItem[]>([  
    { id: "r1", title: "Content 1", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "r2", title: "Content 2", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "r3", title: "Content 3", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "p1", title: "Content 4", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "p2", title: "Content 5", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "p3", title: "Content 6", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "r4", title: "Content 7", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "p4", title: "Content 8", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "r5", title: "Content 9", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
  ]);

  const selectedIds = activeTab === "reels" ? selectedReelsIds : selectedPostsIds;

  function handleBack() {
    router.push("/growsync/disconnect");
  }

  function handlePublish() {
  publishedIdsRef.current = [...publishedIdsRef.current, ...selectedIds];

  setData((prev) =>
    prev
      .filter((item) => !publishedIdsRef.current.includes(item.id))
      .map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "imported" }
          : item
      )
  );

  setSelectedReelsIds([]);
  setSelectedPostsIds([]);
  setShowOnlySelected(false);

  router.navigate("/(drawer)/(tabs)/profile");
}

  function handleImport() {
    setIsImporting(true);
    setShowOnlySelected(true);

    setData((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "importing" }
          : item
      )
    );

    setTimeout(() => {
      setData((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, status: "imported" }
            : item
        )
      );
      setIsImporting(false);
    }, 2000);
  }

  function toggleSelection(id: string) {
    if (activeTab === "reels") {
      setSelectedReelsIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedPostsIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  }

  function handleRemove(id: string) {
    setData((prev) => prev.filter((item) => item.id !== id));

    if (activeTab === "reels") {
      setSelectedReelsIds((prev) => {
        const updated = prev.filter((i) => i !== id);
        if (updated.length === 0) {
          setShowOnlySelected(true);
          setIsImporting(false);
          setTimeout(() => {
            const newMockData: ImportDataItem[] = [
              { id: "r5", title: "Content 1", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
              { id: "r6", title: "Content 2", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
              { id: "r7", title: "Content 3", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
              { id: "r8", title: "Content 4", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
            ];
            setData((prev) =>
              prev.filter((item) => item.type !== "reels").concat(newMockData)
            );
            setShowOnlySelected(false);
          }, 1000);
        }
        return updated;
      });
    } else {
      setSelectedPostsIds((prev) => {
        const updated = prev.filter((i) => i !== id);
        if (updated.length === 0) {
          setShowOnlySelected(true);
          setIsImporting(false);
          setTimeout(() => {
            const newMockData: ImportDataItem[] = [
              { id: "p5", title: "Content 5", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
              { id: "p6", title: "Content 6", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
              { id: "p7", title: "Content 7", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
              { id: "p8", title: "Content 8", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
            ];
            setData((prev) =>
              prev.filter((item) => item.type !== "posts").concat(newMockData)
            );
            setShowOnlySelected(false);
          }, 1000);
        }
        return updated;
      });
    }
  }

  function groupByMonthAndYear(data: ImportDataItem[]) {
    const months = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    const groups: Record<string, ImportDataItem[]> = {};

    const filtered = data.filter((item) => item.type === activeTab);
    const visible = showOnlySelected
  ? filtered.filter((item) => selectedIds.includes(item.id))
  : filtered.filter((item) => !publishedIdsRef.current.includes(item.id));

    visible.forEach((item) => {
      const date = new Date(item.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.entries(groups).map(([title, groupData]) => ({
      title,
      data: groupData,
    }));
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

  const groupedData = groupByMonthAndYear(data);
  const anyImportedItems = data.some((item) => item.status === "imported");
  const allImported = anyImportedItems;
  const hasSelection = selectedIds.length > 0;

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
            {isImporting
              ? "Wait for your import to be completed before publishing it on growzone"
              : allImported
              ? "Manage your imported content in this section."
              : `Select your Instagram ${activeTab === "reels" ? "reels" : "posts"} to share on Growzone`}
          </Text>
        </View>

        <View className="px-6 mt-6">
          <View className="flex-row border-b border-black-80">
            {["posts", "reels"].map((tab) => {
                const isActive = activeTab === tab;
                const isBlocked =
                  (selectedReelsIds.length > 0 && tab === "posts") ||
                  (selectedPostsIds.length > 0 && tab === "reels") ||
                  data.some(
                    (item) =>
                      item.status === "imported" &&
                      ((tab === "posts" && item.type === "reels") ||
                      (tab === "reels" && item.type === "posts"))
                  );

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

        <SectionList
          sections={groupedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 120,
          }}
          renderItem={({ item }: ListRenderItemInfo<ImportDataItem>) => (
            <ImportItemCard
              title={item.title}
              date={item.date}
              thumbnail={item.thumbnail}
              selected={selectedIds.includes(item.id)}
              status={item.status}
              onSelect={() => toggleSelection(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-white text-sm font-semibold mt-4 mb-2">
              {title}
            </Text>
          )}
        />

        <View className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-black-80 bg-black-100">
          <TouchableOpacity
          disabled={(!hasSelection && !anyImportedItems) || (isImporting && !anyImportedItems)}
          onPress={anyImportedItems ? handlePublish : handleImport}
          className={`w-full py-3 rounded-lg items-center justify-center ${
            isImporting && !anyImportedItems
              ? "bg-[#B6B6B6]"
              : anyImportedItems
              ? "bg-[#32CD32]"
              : hasSelection
              ? "bg-[#32CD32]"
              : "bg-black-80"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isImporting && !anyImportedItems
                ? "text-black"
                : anyImportedItems || hasSelection
                ? "text-black"
                : "text-black-50"
            }`}
          >
            {anyImportedItems
              ? "Publish"
              : isImporting
              ? "Importing..."
              : "Import"}
          </Text>
        </TouchableOpacity>
        </View>
      </View>
      {showModal && (
         <BlurView intensity={80} tint="dark" className="flex-1 justify-center items-center px-6 absolute inset-0">
          <Animated.View style={{ transform: [{ translateY }], width: "100%", maxWidth: 360 }}>
            <ReportModal
              title="Tab switch not allowed"
              description="You can’t switch tabs after selecting content. To choose a different tab, please clear your current selection first."
              primaryLabel="Cancel"
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

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { screens } from "@/constants/screens";
import ImportItemCard from "@/components/ui/ImportItemCard";

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
  const [activeTab, setActiveTab] = useState<"reels" | "posts">("reels");
  const [selectedReelsIds, setSelectedReelsIds] = useState<string[]>([]);
  const [selectedPostsIds, setSelectedPostsIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const [data, setData] = useState<ImportDataItem[]>([  
    { id: "r1", title: "Content 1", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "r2", title: "Content 2", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "r3", title: "Content 3", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "p1", title: "Content 4", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "p2", title: "Content 5", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "p3", title: "Content 6", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
    { id: "r4", title: "Content 7", date: "2025-02-24", thumbnail: "", status: "idle", type: "reels" },
    { id: "p4", title: "Content 8", date: "2025-01-24", thumbnail: "", status: "idle", type: "posts" },
  ]);

  const selectedIds = activeTab === "reels" ? selectedReelsIds : selectedPostsIds;

  function handleBack() {
    router.push("/growsync/disconnect");
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
          setIsImporting(true);
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
            setIsImporting(false);
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
          setIsImporting(true);
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
            setIsImporting(false);
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
      : filtered;

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

  const groupedData = groupByMonthAndYear(data);
  const allSelectedItems = data.filter((item) => selectedIds.includes(item.id));
  const allImported = allSelectedItems.length > 0 && allSelectedItems.every((item) => item.status === "imported");
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
            Wait for your import to be completed before publishing it on growzone
          </Text>
        </View>

        <View className="px-6 mt-6">
          <View className="flex-row border-b border-black-80">
            {["reels", "posts"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  className="flex-1 items-center pb-2"
                  onPress={() => setActiveTab(tab as "reels" | "posts")}
                >
                  <Text
                    className={`text-base font-semibold ${
                      isActive ? "text-white" : "text-black-50"
                    }`}
                  >
                    {tab === "reels" ? "Reels" : "Posts"}
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
            disabled={!hasSelection || isImporting}
            onPress={handleImport}
            className={`w-full py-3 rounded-lg items-center justify-center ${
              isImporting
                ? "bg-[#B6B6B6]"
                : allImported
                ? "bg-[#32CD32]"
                : hasSelection
                ? "bg-[#32CD32]"
                : "bg-black-80"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isImporting
                  ? "text-black"
                  : allImported
                  ? "text-black"
                  : hasSelection
                  ? "text-black"
                  : "text-black-50"
              }`}
            >
              {allImported ? "Publish" : isImporting ? "Importing..." : "Import"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

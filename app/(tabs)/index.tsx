import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Screen } from "@/components/screen";
import { useAppStore } from "@/store/use-app-store";
import { Category, CurrentAccount, MarketplaceUser, Task, UserRole } from "@/lib/types";

const roleCopy: Record<UserRole, { title: string; subtitle: string; cta: string }> = {
  poster: {
    title: "Post a job and hire fast",
    subtitle: "Set the brief, name a price, and negotiate in chat with trusted locals.",
    cta: "You are posting today"
  },
  tasker: {
    title: "Find polished local work",
    subtitle: "Browse nearby jobs, ask clarifying questions, and send your best offer.",
    cta: "You are tasking today"
  }
};

export default function DiscoverScreen() {
  const router = useRouter();
  const activeRole = useAppStore((state) => state.activeRole);
  const selectRole = useAppStore((state) => state.selectRole);
  const tasks = useAppStore((state) => state.tasks);
  const categories = useAppStore((state) => state.categories);
  const highlights = useAppStore((state) => state.highlights);
  const currentAccount = useAppStore((state) => state.currentAccount);
  const users = useAppStore((state) => state.users);
  const status = useAppStore((state) => state.status);
  const error = useAppStore((state) => state.error);
  const refreshMarketplace = useAppStore((state) => state.refreshMarketplace);
  const openConversationForTask = useAppStore((state) => state.openConversationForTask);
  const selectedCategoryId = useAppStore((state) => state.selectedCategoryId);
  const selectCategory = useAppStore((state) => state.selectCategory);

  const copy = roleCopy[activeRole];
  const topTaskers = [...users]
    .sort((left, right) => right.taskerRating.average - left.taskerRating.average)
    .slice(0, 3);

  const filteredTasks = useMemo(() => {
    if (!selectedCategoryId) {
      return tasks;
    }

    return tasks.filter((task) => task.categoryId === selectedCategoryId);
  }, [selectedCategoryId, tasks]);

  const handleOpenTask = async (taskId: string) => {
    const conversationId = await openConversationForTask(taskId);
    if (conversationId) {
      router.push("/(tabs)/alerts");
    }
  };

  return (
    <Screen>
      <LinearGradient
        colors={["#f4f1ea", "#dff6e6", "#f4e6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[32px] border border-[#e6ded0] px-5 pb-6 pt-6"
      >
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#56705e]">
          TaskDash
        </Text>
        <Text className="mt-3 text-[34px] font-black leading-[40px] text-[#08101c]">
          {copy.title}
        </Text>
        <Text className="mt-3 text-sm leading-6 text-[#4f5d70]">{copy.subtitle}</Text>

        <View className="mt-6 gap-3">
          <View className="flex-row gap-3">
            <RoleCard
              label="Poster"
              icon="create-outline"
              active={activeRole === "poster"}
              description="List jobs, compare offers, and book the right person."
              onPress={() => selectRole("poster")}
            />
            <RoleCard
              label="Tasker"
              icon="flash-outline"
              active={activeRole === "tasker"}
              description="Find nearby jobs, quote quickly, and build repeat clients."
              onPress={() => selectRole("tasker")}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Open tasks" value={String(highlights?.openTasks ?? tasks.length)} />
            <StatCard label="Active taskers" value={String(highlights?.activeTaskers ?? 0)} />
            <StatCard label="Avg reply" value={highlights?.averageReply ?? "Live"} />
          </View>
        </View>

        <View className="mt-6 rounded-[24px] bg-white/70 px-4 py-4">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#56705e]">
            Your account
          </Text>
          <Text className="mt-2 text-lg font-bold text-[#08101c]">
            {currentAccount?.name ?? "Loading profile"}
          </Text>
          <Text className="mt-1 text-sm text-[#4f5d70]">
            {currentAccount ? `${currentAccount.homeBase} | ZIP ${currentAccount.zipCode}` : copy.cta}
          </Text>
        </View>
      </LinearGradient>

      <SectionHeader title="Popular categories" detail={selectedCategoryId ? "Filter applied" : copy.cta} />
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            selected={item.id === selectedCategoryId}
            onPress={() => selectCategory(item.id === selectedCategoryId ? null : item.id)}
          />
        )}
      />

      <SectionHeader title="Top rated taskers" detail="By stars and completed work" />
      <View className="gap-3">
        {topTaskers.map((user) => (
          <RankingCard key={user.id} user={user} />
        ))}
      </View>

      <SectionHeader
        title={activeRole === "poster" ? "Your live jobs" : "Nearby work"}
        detail={`${filteredTasks.length} available`}
      />

      {error ? (
        <View className="rounded-[24px] border border-[#efd3d3] bg-[#fff4f4] px-5 py-5">
          <Text className="text-base font-bold text-[#5f1d1d]">
            Backend unavailable, local prototype still loaded
          </Text>
          <Text className="mt-2 text-sm leading-6 text-[#8b3b3b]">{error}</Text>
          <Pressable
            onPress={() => void refreshMarketplace()}
            className="mt-4 rounded-full bg-[#08101c] px-4 py-3"
          >
            <Text className="text-center text-sm font-bold text-white">
              {status === "loading" ? "Refreshing..." : "Retry backend"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            category={categories.find((category) => category.id === item.categoryId)}
            poster={
              item.postedBy === currentAccount?.id
                ? currentAccount
                : users.find((user) => user.id === item.postedBy)
            }
            tasker={item.assignedTo ? users.find((user) => user.id === item.assignedTo) : undefined}
            isPosterView={activeRole === "poster"}
            onOpenThread={() => void handleOpenTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="rounded-[24px] border border-dashed border-[#d8d0c3] bg-[#faf7f2] px-5 py-8">
            <Text className="text-base font-bold text-[#08101c]">No tasks in this category</Text>
            <Text className="mt-2 text-sm leading-6 text-[#5b6779]">
              Clear the filter or post a new job to start activity here.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <View className="mb-4 mt-8 flex-row items-center justify-between">
      <Text className="text-lg font-bold text-[#08101c]">{title}</Text>
      <Text className="text-sm font-semibold text-[#56705e]">{detail}</Text>
    </View>
  );
}

function RoleCard({
  label,
  icon,
  description,
  active,
  onPress
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[152px] flex-1 rounded-[24px] border px-4 py-4 ${
        active ? "border-[#08101c] bg-white" : "border-[#e3ddcf] bg-white/50"
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#ecf3ea]">
        <Ionicons name={icon} size={18} color="#08101c" />
      </View>
      <Text className="mt-4 text-base font-bold text-[#08101c]">{label}</Text>
      <Text className="mt-2 text-sm leading-5 text-[#596579]">{description}</Text>
    </Pressable>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-[22px] bg-[#08101c] px-4 py-4">
      <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#9cb4a4]">
        {label}
      </Text>
      <Text className="mt-2 text-lg font-bold text-white">{value}</Text>
    </View>
  );
}

function CategoryCard({
  category,
  onPress,
  selected
}: {
  category: Category;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-[132px] rounded-[24px] border px-4 py-4 ${
        selected ? "border-[#08101c]" : "border-[#e8e1d5]"
      }`}
      style={{ backgroundColor: category.accent }}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white/80">
        <Ionicons
          name={category.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color="#08101c"
        />
      </View>
      <Text className="mt-5 text-base font-bold text-[#08101c]">{category.label}</Text>
      <Text className="mt-1 text-xs font-medium text-[#435062]">
        {selected ? "Filtering tasks" : "Trusted local supply"}
      </Text>
    </Pressable>
  );
}

function RankingCard({ user }: { user: MarketplaceUser }) {
  return (
    <View className="rounded-[24px] border border-[#e8e1d5] bg-white px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-[#08101c]">{user.name}</Text>
          <Text className="mt-1 text-sm leading-5 text-[#5b6779]">{user.tagline}</Text>
        </View>
        <View className="rounded-full bg-[#f6f3ed] px-3 py-2">
          <Text className="text-sm font-bold text-[#08101c]">
            {user.taskerRating.average.toFixed(1)} stars
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-3">
        <MetaPill icon="checkmark-done-outline" text={`${user.jobsCompleted} done`} />
        <MetaPill icon="chatbubble-outline" text={user.responseTime} />
        <MetaPill icon="star-outline" text={`${user.taskerRating.count} reviews`} />
        <MetaPill icon="navigate-outline" text={`ZIP ${user.zipCode}`} />
      </View>
    </View>
  );
}

function TaskCard({
  task,
  category,
  poster,
  tasker,
  isPosterView,
  onOpenThread
}: {
  task: Task;
  category?: Category;
  poster?: CurrentAccount | MarketplaceUser;
  tasker?: MarketplaceUser;
  isPosterView: boolean;
  onOpenThread: () => void;
}) {
  const posterRating =
    poster && "posterStats" in poster ? poster.posterStats.rating : poster?.posterRating;

  return (
    <View className="rounded-[28px] border border-[#e8e1d5] bg-white px-5 py-5">
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6f7d8d]">
            {category?.label ?? "Local task"}
          </Text>
          <Text className="mt-2 text-xl font-bold leading-7 text-[#08101c]">{task.title}</Text>
        </View>
        <View className="rounded-full bg-[#eff8f1] px-3 py-2">
          <Text className="text-sm font-bold text-[#214a35]">
            ${task.agreedPrice ?? task.budget}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-sm leading-6 text-[#5b6779]">{task.description}</Text>

      <View className="mt-5 flex-row flex-wrap gap-2">
        <Pill icon="location-outline" text={task.location} />
        <Pill icon="navigate-outline" text={task.zipCode} />
        <Pill icon="time-outline" text={task.timeline} />
        <Pill icon="layers-outline" text={task.status} />
      </View>

      <View className="mt-4 rounded-[22px] bg-[#faf7f2] px-4 py-4">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6f7d8d]">
          Poster
        </Text>
        <Text className="mt-2 text-base font-bold text-[#08101c]">{poster?.name ?? "Local poster"}</Text>
        <View className="mt-3 flex-row gap-3">
          <MetaPill
            icon="star-outline"
            text={posterRating ? `${posterRating.average.toFixed(1)} stars` : "Trusted locally"}
          />
          <MetaPill
            icon="chatbubble-ellipses-outline"
            text={`${task.offers} offers | ${task.questions} questions`}
          />
        </View>
      </View>

      {tasker ? (
        <View className="mt-4 rounded-[22px] bg-[#eef7ff] px-4 py-4">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#55708e]">
            Assigned tasker
          </Text>
          <Text className="mt-2 text-base font-bold text-[#08101c]">{tasker.name}</Text>
          <View className="mt-3 flex-row gap-3">
            <MetaPill icon="star-outline" text={`${tasker.taskerRating.average.toFixed(1)} stars`} />
            <MetaPill icon="briefcase-outline" text={`${tasker.jobsCompleted} jobs`} />
          </View>
        </View>
      ) : null}

      <View className="mt-5 flex-row flex-wrap gap-2">
        {task.tags.map((tag) => (
          <View key={tag} className="rounded-full bg-[#f3efe8] px-3 py-2">
            <Text className="text-xs font-semibold text-[#6f7d8d]">{tag}</Text>
          </View>
        ))}
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-[#7d8898]">{task.postedAt}</Text>
        <Pressable onPress={onOpenThread} className="rounded-full bg-[#08101c] px-4 py-3">
          <Text className="text-sm font-bold text-white">
            {task.status === "completed"
              ? "View thread"
              : isPosterView
                ? "Open negotiations"
                : "Send offer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Pill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center rounded-full bg-[#f6f3ed] px-3 py-2">
      <Ionicons name={icon} size={14} color="#6f7d8d" />
      <Text className="ml-2 text-xs font-semibold capitalize text-[#5b6779]">{text}</Text>
    </View>
  );
}

function MetaPill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center rounded-full bg-white px-3 py-2">
      <Ionicons name={icon} size={14} color="#6f7d8d" />
      <Text className="ml-2 text-xs font-semibold text-[#5b6779]">{text}</Text>
    </View>
  );
}

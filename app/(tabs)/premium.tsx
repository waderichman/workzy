import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/screen";
import { useAppStore } from "@/store/use-app-store";

export default function ProfileScreen() {
  const activeRole = useAppStore((state) => state.activeRole);
  const selectRole = useAppStore((state) => state.selectRole);
  const logout = useAppStore((state) => state.logout);
  const currentAccount = useAppStore((state) => state.currentAccount);
  const tasks = useAppStore((state) => state.tasks);
  const conversations = useAppStore((state) => state.conversations);
  const reviews = useAppStore((state) => state.reviews);
  const users = useAppStore((state) => state.users);

  const topPoster = [...users].sort(
    (left, right) => right.posterRating.average - left.posterRating.average
  )[0];

  return (
    <Screen>
      <View className="rounded-[32px] border border-[#e6ded0] bg-white px-5 pb-6 pt-6">
        <View className="flex-row items-start justify-between">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#d8f6df]">
            <Text className="text-2xl font-black text-[#08101c]">
              {currentAccount?.name?.slice(0, 1) ?? "N"}
            </Text>
          </View>
          <View className="rounded-full bg-[#08101c] px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#9cb4a4]">
              Active mode
            </Text>
            <Text className="mt-1 text-sm font-bold capitalize text-white">{activeRole}</Text>
          </View>
        </View>
        <Text className="mt-4 text-3xl font-black text-[#08101c]">
          {currentAccount?.name ?? "Local account"}
        </Text>
        <Pressable onPress={() => void logout()} className="mt-4 self-start rounded-full bg-[#08101c] px-4 py-3">
          <Text className="text-sm font-bold text-white">Log out</Text>
        </Pressable>
        <Text className="mt-2 text-sm leading-6 text-[#5b6779]">
          {currentAccount?.bio ?? "Marketplace profile"}
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <Badge
            icon="location-outline"
            text={
              currentAccount
                ? `${currentAccount.homeBase} | ZIP ${currentAccount.zipCode}`
                : "Los Angeles"
            }
          />
          <Badge icon="chatbubble-ellipses-outline" text={`${conversations.length} open chats`} />
          <Badge icon="star-outline" text={`${reviews.length} total reviews`} />
        </View>
      </View>

      <View className="mt-8 gap-4">
        <PerformanceCard
          title="Poster score"
          rating={currentAccount?.posterStats.rating.average ?? 0}
          reviewCount={currentAccount?.posterStats.rating.count ?? 0}
          primary={`${currentAccount?.posterStats.completedCount ?? 0} tasks completed`}
          secondary={`${currentAccount?.posterStats.hireRate ?? "0%"} hire rate`}
        />
        <PerformanceCard
          title="Tasker score"
          rating={currentAccount?.taskerStats.rating.average ?? 0}
          reviewCount={currentAccount?.taskerStats.rating.count ?? 0}
          primary={`${currentAccount?.taskerStats.completedCount ?? 0} jobs completed`}
          secondary={`${currentAccount?.taskerStats.earningsLabel ?? "$0"} earned`}
        />
      </View>

      <View className="mt-8 rounded-[28px] border border-[#e8e1d5] bg-[#08101c] px-5 py-5">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#9cb4a4]">
          Switch side
        </Text>
        <Text className="mt-3 text-2xl font-bold text-white">
          One account, two marketplace reputations.
        </Text>
        <Text className="mt-3 text-sm leading-6 text-[#c0c9d5]">
          Your star rating is tracked separately as a poster and as a tasker.
        </Text>
        <View className="mt-6 flex-row gap-3">
          <RoleToggle
            label="Poster"
            active={activeRole === "poster"}
            onPress={() => selectRole("poster")}
          />
          <RoleToggle
            label="Tasker"
            active={activeRole === "tasker"}
            onPress={() => selectRole("tasker")}
          />
        </View>
      </View>

      <View className="mt-8 rounded-[28px] border border-[#e8e1d5] bg-white px-5 py-5">
        <Text className="text-lg font-bold text-[#08101c]">Marketplace standing</Text>
        <AccountRow icon="briefcase-outline" label="Visible local tasks" value={String(tasks.length)} />
        <AccountRow
          icon="shield-checkmark-outline"
          label="Service area"
          value={currentAccount ? `${currentAccount.serviceZipCodes.length} ZIP codes` : "Loading"}
        />
        <AccountRow
          icon="ribbon-outline"
          label="Top poster nearby"
          value={
            topPoster
              ? `${topPoster.name} | ${topPoster.posterRating.average.toFixed(1)} stars`
              : "Loading"
          }
        />
      </View>
    </Screen>
  );
}

function PerformanceCard({
  title,
  rating,
  reviewCount,
  primary,
  secondary
}: {
  title: string;
  rating: number;
  reviewCount: number;
  primary: string;
  secondary: string;
}) {
  return (
    <View className="rounded-[26px] border border-[#e8e1d5] bg-[#faf7f2] px-5 py-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#08101c]">{title}</Text>
        <View className="rounded-full bg-white px-3 py-2">
          <Text className="text-sm font-bold text-[#08101c]">{rating.toFixed(1)} stars</Text>
        </View>
      </View>
      <Text className="mt-2 text-sm leading-6 text-[#5b6779]">{primary}</Text>
      <View className="mt-4 flex-row gap-3">
        <Badge icon="star-outline" text={`${reviewCount} reviews`} />
        <Badge icon="checkmark-done-outline" text={secondary} />
      </View>
    </View>
  );
}

function Badge({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center rounded-full bg-[#f6f3ed] px-4 py-3">
      <Ionicons name={icon} size={14} color="#6f7d8d" />
      <Text className="ml-2 text-xs font-semibold text-[#5b6779]">{text}</Text>
    </View>
  );
}

function RoleToggle({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-full px-4 py-4 ${
        active ? "bg-[#d8f6df]" : "bg-white/10"
      }`}
    >
      <Text
        className={`text-center text-sm font-bold ${
          active ? "text-[#08101c]" : "text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AccountRow({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="mt-4 flex-row items-center justify-between rounded-[20px] bg-[#faf7f2] px-4 py-4">
      <View className="mr-4 flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name={icon} size={18} color="#08101c" />
        </View>
        <Text className="ml-3 text-sm font-semibold text-[#08101c]">{label}</Text>
      </View>
      <Text className="text-right text-sm font-medium text-[#5b6779]">{value}</Text>
    </View>
  );
}

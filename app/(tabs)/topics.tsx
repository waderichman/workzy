import { ComponentProps, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Screen } from "@/components/screen";
import { useAppStore } from "@/store/use-app-store";

export default function PostTaskScreen() {
  const router = useRouter();
  const activeRole = useAppStore((state) => state.activeRole);
  const categories = useAppStore((state) => state.categories);
  const createTask = useAppStore((state) => state.createTask);
  const openConversationForTask = useAppStore((state) => state.openConversationForTask);
  const selectRole = useAppStore((state) => state.selectRole);
  const error = useAppStore((state) => state.error);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Santa Monica");
  const [zipCode, setZipCode] = useState("90401");
  const [timeline, setTimeline] = useState("Tomorrow evening");
  const [budget, setBudget] = useState("120");
  const [selectedCategoryId, setSelectedCategoryId] = useState("moving");
  const [tags, setTags] = useState("same day, careful handling");

  const submit = async () => {
    const parsedBudget = Number(budget);

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      Number.isNaN(parsedBudget) ||
      !/^\d{5}$/.test(zipCode.trim())
    ) {
      Alert.alert("Missing details", "Add a title, description, location, valid zip code, and valid budget.");
      return;
    }

    const taskId = await createTask({
      title: title.trim(),
      description: description.trim(),
      categoryId: selectedCategoryId,
      location: location.trim(),
      zipCode: zipCode.trim(),
      budget: parsedBudget,
      timeline: timeline.trim() || "Flexible",
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    });

    if (!taskId) {
      Alert.alert("Task not posted", "The backend did not accept the task.");
      return;
    }

    await openConversationForTask(taskId);

    setTitle("");
    setDescription("");
    setBudget("120");
    setTags("same day, careful handling");
    Alert.alert("Task posted", "Your task is now live and a thread is ready.");
    router.push("/(tabs)/alerts");
  };

  if (activeRole === "tasker") {
    return (
      <Screen>
        <View className="rounded-[32px] border border-[#e6ded0] bg-[#08101c] px-5 pb-6 pt-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#9cb4a4]">
            Tasker mode
          </Text>
          <Text className="mt-3 text-3xl font-black leading-9 text-white">
            You are currently browsing as a tasker.
          </Text>
          <Text className="mt-3 text-sm leading-6 text-[#c0c9d5]">
            Switch to poster when you want to publish a job, set an opening budget, and invite
            offers in chat.
          </Text>
          <Pressable
            onPress={() => selectRole("poster")}
            className="mt-6 rounded-full bg-[#d8f6df] px-4 py-4"
          >
            <Text className="text-center text-sm font-bold text-[#08101c]">
              Switch to Poster
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-[28px] border border-[#e8e1d5] bg-white px-5 py-5">
          <Text className="text-lg font-bold text-[#08101c]">How taskers win jobs</Text>
          <AdviceRow icon="chatbubble-ellipses-outline" text="Ask one clear question before quoting." />
          <AdviceRow icon="cash-outline" text="Counter with a number and what is included." />
          <AdviceRow icon="shield-checkmark-outline" text="Lead with reliability, speed, and proof." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="text-3xl font-black text-[#08101c]">Post a task</Text>
      <Text className="mt-3 text-sm leading-6 text-[#5b6779]">
        Keep the brief simple and sharp. Local taskers can ask questions and negotiate inside the
        app before you book.
      </Text>

      {error ? (
        <View className="mt-5 rounded-[20px] border border-[#efd3d3] bg-[#fff4f4] px-4 py-4">
          <Text className="text-sm font-semibold text-[#8b3b3b]">{error}</Text>
        </View>
      ) : null}

      <View className="mt-8 rounded-[28px] border border-[#e8e1d5] bg-white px-5 py-5">
        <FormField label="Task title" value={title} onChangeText={setTitle} placeholder="What do you need done?" />
        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details, access notes, materials, or photos later in chat."
          multiline
        />
        <FormField label="Location" value={location} onChangeText={setLocation} placeholder="Neighborhood or suburb" />
        <FormField label="Timeline" value={timeline} onChangeText={setTimeline} placeholder="When should it happen?" />
        <FormField
          label="Zip code"
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="90401"
          keyboardType="number-pad"
        />
        <FormField
          label="Opening budget"
          value={budget}
          onChangeText={setBudget}
          placeholder="120"
          keyboardType="numeric"
        />
        <FormField
          label="Tags"
          value={tags}
          onChangeText={setTags}
          placeholder="same day, tools required"
        />

        <Text className="mt-5 text-sm font-bold text-[#08101c]">Category</Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {categories.map((category) => {
            const selected = category.id === selectedCategoryId;

            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                className={`rounded-full border px-4 py-3 ${
                  selected ? "border-[#08101c] bg-[#d8f6df]" : "border-[#e8e1d5] bg-[#f6f3ed]"
                }`}
              >
                <Text className="text-sm font-semibold text-[#08101c]">{category.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={submit} className="mt-8 rounded-[24px] bg-[#08101c] px-4 py-4">
          <Text className="text-center text-base font-black text-white">Publish task</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function FormField({
  label,
  multiline,
  ...props
}: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View className="mt-5">
      <Text className="text-sm font-bold text-[#08101c]">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#8a95a5"
        className={`mt-3 rounded-[20px] border border-[#e8e1d5] bg-[#faf7f2] px-4 py-4 text-[#08101c] ${
          multiline ? "min-h-[120px]" : ""
        }`}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function AdviceRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="mt-4 flex-row items-center rounded-[20px] bg-[#f6f3ed] px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={18} color="#08101c" />
      </View>
      <Text className="ml-3 flex-1 text-sm leading-6 text-[#5b6779]">{text}</Text>
    </View>
  );
}

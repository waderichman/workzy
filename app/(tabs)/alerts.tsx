import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/screen";
import { useAppStore } from "@/store/use-app-store";

export default function InboxScreen() {
  const currentAccount = useAppStore((state) => state.currentAccount);
  const conversations = useAppStore((state) => state.conversations);
  const tasks = useAppStore((state) => state.tasks);
  const users = useAppStore((state) => state.users);
  const reviews = useAppStore((state) => state.reviews);
  const selectedConversationId = useAppStore((state) => state.selectedConversationId);
  const selectConversation = useAppStore((state) => state.selectConversation);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const acceptLatestOffer = useAppStore((state) => state.acceptLatestOffer);
  const completeTask = useAppStore((state) => state.completeTask);
  const leaveReview = useAppStore((state) => state.leaveReview);
  const refreshMarketplace = useAppStore((state) => state.refreshMarketplace);
  const error = useAppStore((state) => state.error);
  const status = useAppStore((state) => state.status);
  const [draft, setDraft] = useState("");

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ??
    conversations[0];

  const selectedTask = tasks.find((task) => task.id === selectedConversation?.taskId);
  const counterpartId = selectedConversation?.participantIds.find((id) => id !== currentAccount?.id);
  const counterpart = users.find((user) => user.id === counterpartId);
  const latestOffer = [...(selectedConversation?.messages ?? [])]
    .reverse()
    .find((message) => message.offerAmount);

  const threadRows = useMemo(
    () =>
      conversations.map((conversation) => {
        const task = tasks.find((item) => item.id === conversation.taskId);
        const personId = conversation.participantIds.find((id) => id !== currentAccount?.id);
        const person = users.find((user) => user.id === personId);
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        return {
          id: conversation.id,
          taskTitle: task?.title ?? "Task",
          personName: person?.name ?? "Local user",
          preview: lastMessage?.text ?? "No messages yet",
          amount: lastMessage?.offerAmount,
          active: conversation.id === selectedConversation?.id,
          status: task?.status ?? "open"
        };
      }),
    [conversations, currentAccount?.id, selectedConversation?.id, tasks, users]
  );

  const reviewTargets = useMemo(() => {
    if (!selectedTask || !currentAccount || !counterpart) {
      return { canReviewTasker: false, canReviewPoster: false };
    }

    const myId = currentAccount.id;

    return {
      canReviewTasker:
        selectedTask.status === "completed" &&
        selectedTask.postedBy === myId &&
        !reviews.some(
          (review) =>
            review.taskId === selectedTask.id &&
            review.reviewerId === myId &&
            review.revieweeId === counterpart.id &&
            review.role === "tasker"
        ),
      canReviewPoster:
        selectedTask.status === "completed" &&
        selectedTask.assignedTo === myId &&
        !reviews.some(
          (review) =>
            review.taskId === selectedTask.id &&
            review.reviewerId === myId &&
            review.revieweeId === counterpart.id &&
            review.role === "poster"
        )
    };
  }, [counterpart, currentAccount, reviews, selectedTask]);

  const submitMessage = (kind: "message" | "question" = "message") => {
    if (!selectedConversation || !draft.trim()) {
      return;
    }

    void sendMessage(selectedConversation.id, draft.trim(), { kind });
    setDraft("");
  };

  const submitOffer = (amount: number) => {
    if (!selectedConversation) {
      return;
    }

    void sendMessage(selectedConversation.id, `I can do this for $${amount}.`, {
      kind: "offer",
      offerAmount: amount
    });
  };

  return (
    <Screen>
      <Text className="text-3xl font-black text-[#08101c]">Inbox</Text>
      <Text className="mt-3 text-sm leading-6 text-[#5b6779]">
        Ask questions, negotiate price, accept the deal, and leave a review after completion.
      </Text>

      {error ? (
        <View className="mt-5 rounded-[20px] border border-[#efd3d3] bg-[#fff4f4] px-4 py-4">
          <Text className="text-sm font-semibold text-[#8b3b3b]">{error}</Text>
          <Pressable
            onPress={() => void refreshMarketplace()}
            className="mt-3 rounded-full bg-[#08101c] px-4 py-3"
          >
            <Text className="text-center text-sm font-bold text-white">
              {status === "loading" ? "Refreshing..." : "Retry sync"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-8 rounded-[28px] border border-[#e8e1d5] bg-white px-4 py-4">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#6f7d8d]">
          Active threads
        </Text>
        <FlatList
          className="mt-4"
          data={threadRows}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectConversation(item.id)}
              className={`w-[224px] rounded-[24px] border px-4 py-4 ${
                item.active ? "border-[#08101c] bg-[#d8f6df]" : "border-[#ece4d8] bg-[#faf7f2]"
              }`}
            >
              <Text className="text-sm font-bold text-[#08101c]">{item.personName}</Text>
              <Text className="mt-1 text-sm text-[#5b6779]">{item.taskTitle}</Text>
              <Text className="mt-4 text-sm leading-5 text-[#6f7d8d]" numberOfLines={2}>
                {item.preview}
              </Text>
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6f7d8d]">
                  {item.status}
                </Text>
                {item.amount ? (
                  <Text className="text-sm font-bold text-[#214a35]">${item.amount}</Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      </View>

      <View className="mt-6 rounded-[28px] border border-[#e8e1d5] bg-[#08101c] px-5 py-5">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#9cb4a4]">
          Current negotiation
        </Text>
        <Text className="mt-3 text-2xl font-bold leading-8 text-white">
          {selectedTask?.title ?? "Select a thread"}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-[#c0c9d5]">
          {counterpart
            ? `${counterpart.name} | ${counterpart.taskerRating.average.toFixed(1)} tasker stars | ${counterpart.posterRating.average.toFixed(1)} poster stars`
            : "Open a conversation to start negotiating."}
        </Text>

        <View className="mt-5 gap-3">
          <View className="flex-row gap-3">
            <QuickAction
              label="Ask question"
              onPress={() => {
                setDraft("Can you confirm the access details?");
              }}
            />
            <QuickAction label="Offer $140" onPress={() => submitOffer(140)} />
            <QuickAction label="Offer $160" onPress={() => submitOffer(160)} />
          </View>
          <View className="flex-row gap-3">
            <QuickAction
              label={latestOffer?.offerAmount ? `Accept $${latestOffer.offerAmount}` : "Accept offer"}
              onPress={() => void (selectedConversation && acceptLatestOffer(selectedConversation.id))}
            />
            <QuickAction
              label="Mark complete"
              onPress={() => void (selectedTask && completeTask(selectedTask.id))}
            />
          </View>
        </View>
      </View>

      <View className="mt-6 rounded-[28px] border border-[#e8e1d5] bg-white px-4 py-4">
        {selectedConversation?.messages.map((message) => {
          const isSystem = message.kind === "system";
          const isMine = message.senderId === currentAccount?.id;
          const sender = isSystem
            ? "System"
            : isMine
              ? currentAccount?.name
              : counterpart?.name ?? "Local user";

          return (
            <View
              key={message.id}
              className={`mb-3 rounded-[22px] px-4 py-4 ${
                isSystem
                  ? "bg-[#f4f1ea]"
                  : isMine
                    ? "self-end bg-[#d8f6df]"
                    : "bg-[#f6f3ed]"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#08101c]">{sender}</Text>
                <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6f7d8d]">
                  {message.kind}
                </Text>
              </View>
              <Text className="mt-2 text-sm leading-6 text-[#445164]">{message.text}</Text>
              {message.offerAmount ? (
                <View className="mt-3 flex-row items-center rounded-full bg-white/70 px-3 py-2">
                  <Ionicons name="cash-outline" size={14} color="#214a35" />
                  <Text className="ml-2 text-xs font-bold text-[#214a35]">
                    ${message.offerAmount} proposed
                  </Text>
                </View>
              ) : null}
              <Text className="mt-3 text-xs text-[#7d8898]">{message.sentAt}</Text>
            </View>
          );
        })}

        {reviewTargets.canReviewTasker || reviewTargets.canReviewPoster ? (
          <View className="mt-2 rounded-[22px] bg-[#faf7f2] px-4 py-4">
            <Text className="text-sm font-bold text-[#08101c]">Leave a rating</Text>
            <View className="mt-4 flex-row gap-3">
              {reviewTargets.canReviewTasker ? (
                <QuickReview
                  label="Rate tasker 5 stars"
                  onPress={() =>
                    counterpart &&
                    selectedTask &&
                    void leaveReview(
                      selectedTask.id,
                      counterpart.id,
                      "tasker",
                      5,
                      "Excellent work, on time and easy to coordinate."
                    )
                  }
                />
              ) : null}
              {reviewTargets.canReviewPoster ? (
                <QuickReview
                  label="Rate poster 5 stars"
                  onPress={() =>
                    counterpart &&
                    selectedTask &&
                    void leaveReview(
                      selectedTask.id,
                      counterpart.id,
                      "poster",
                      5,
                      "Clear brief, smooth communication, and paid promptly."
                    )
                  }
                />
              ) : null}
            </View>
          </View>
        ) : null}

        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message or ask a question"
          placeholderTextColor="#8a95a5"
          className="mt-3 rounded-[22px] border border-[#e8e1d5] bg-[#faf7f2] px-4 py-4 text-[#08101c]"
        />
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => submitMessage("message")}
            className="flex-1 rounded-full bg-[#08101c] px-4 py-4"
          >
            <Text className="text-center text-sm font-bold text-white">Send message</Text>
          </Pressable>
          <Pressable
            onPress={() => submitMessage("question")}
            className="flex-1 rounded-full bg-[#d8f6df] px-4 py-4"
          >
            <Text className="text-center text-sm font-bold text-[#08101c]">Send question</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 rounded-full bg-white/10 px-4 py-3">
      <Text className="text-center text-sm font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

function QuickReview({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 rounded-full bg-[#08101c] px-4 py-3">
      <Text className="text-center text-sm font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

const seed = require("./marketplace-data");

const state = JSON.parse(JSON.stringify(seed));

let cache = {
  fetchedAt: 0,
  payload: null
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function invalidateCache() {
  cache = {
    fetchedAt: 0,
    payload: null
  };
}

function systemMessage(text) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: "system",
    text,
    sentAt: nowLabel(),
    kind: "system"
  };
}

function buildMarketplacePayload() {
  const visibleTasks = getVisibleTasks();
  const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
  const visibleConversations = state.conversations.filter((conversation) =>
    visibleTaskIds.has(conversation.taskId)
  );

  state.highlights.openTasks = visibleTasks.filter((task) => task.status === "open").length;

  return {
    currentAccount: state.currentAccount,
    categories: state.categories,
    users: state.users,
    tasks: visibleTasks,
    conversations: visibleConversations,
    reviews: state.reviews,
    highlights: state.highlights
  };
}

function isZipCode(value) {
  return /^\d{5}$/.test(String(value || ""));
}

function getVisibleTasks() {
  const allowedZips = new Set([
    state.currentAccount.zipCode,
    ...(state.currentAccount.serviceZipCodes || [])
  ]);

  return state.tasks.filter(
    (task) =>
      task.postedBy === state.currentAccount.id ||
      task.assignedTo === state.currentAccount.id ||
      allowedZips.has(task.zipCode)
  );
}

async function refreshFeed(force = false) {
  if (!force && cache.payload && Date.now() - cache.fetchedAt < 120000) {
    return cache.payload;
  }

  cache = {
    fetchedAt: Date.now(),
    payload: buildMarketplacePayload()
  };

  return cache.payload;
}

function getTask(taskId) {
  return state.tasks.find((task) => task.id === taskId);
}

function getConversation(conversationId) {
  return state.conversations.find((conversation) => conversation.id === conversationId);
}

function createTask(input) {
  if (!isZipCode(input.zipCode)) {
    throw new Error("Valid 5-digit zip code required");
  }

  const task = {
    id: `task-${Date.now()}`,
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    location: input.location,
    zipCode: input.zipCode,
    distanceLabel: "Just posted",
    budget: input.budget,
    timeline: input.timeline,
    status: "open",
    postedAt: "now",
    postedBy: state.currentAccount.id,
    offers: 0,
    questions: 0,
    tags: input.tags
  };

  state.tasks.unshift(task);
  state.currentAccount.posterStats.tasksPosted += 1;

  const defaultTasker = state.users[0];
  if (defaultTasker) {
    state.conversations.unshift({
      id: `conv-${Date.now()}`,
      taskId: task.id,
      participantIds: [state.currentAccount.id, defaultTasker.id],
      messages: [
        {
          id: `msg-${Date.now()}-intro`,
          senderId: defaultTasker.id,
          text: `I can likely help with "${task.title}". What time works best for you?`,
          sentAt: nowLabel(),
          kind: "question"
        }
      ]
    });
    task.questions += 1;
  }

  invalidateCache();
  return task;
}

function openConversation(taskId) {
  const task = getTask(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  if (!getVisibleTasks().some((item) => item.id === taskId)) {
    throw new Error("Task is outside your service region");
  }

  const existing = state.conversations.find((conversation) => conversation.taskId === taskId);
  if (existing) {
    return existing;
  }

  const counterpartId =
    task.postedBy === state.currentAccount.id
      ? state.users[0]?.id
      : task.postedBy;

  if (!counterpartId) {
    throw new Error("No counterpart available");
  }

  const conversation = {
    id: `conv-${Date.now()}`,
    taskId,
    participantIds: [state.currentAccount.id, counterpartId],
    messages: [systemMessage("Conversation opened.")]
  };

  state.conversations.unshift(conversation);
  invalidateCache();
  return conversation;
}

function sendMessage(conversationId, text, options = {}) {
  const conversation = getConversation(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = {
    id: `msg-${Date.now()}`,
    senderId: state.currentAccount.id,
    text,
    sentAt: nowLabel(),
    kind: options.kind || "message",
    offerAmount: options.offerAmount
  };

  conversation.messages.push(message);

  const task = getTask(conversation.taskId);
  if (task) {
    if (message.kind === "offer") {
      task.offers += 1;
    }
    if (message.kind === "question") {
      task.questions += 1;
    }
  }

  invalidateCache();
  return message;
}

function acceptLatestOffer(conversationId) {
  const conversation = getConversation(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const latestOffer = [...conversation.messages].reverse().find((message) => message.offerAmount);
  if (!latestOffer || !latestOffer.offerAmount) {
    throw new Error("No offer available");
  }

  const task = getTask(conversation.taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  task.status = "assigned";
  task.assignedTo = conversation.participantIds.find(
    (participantId) => participantId !== state.currentAccount.id
  );
  task.agreedPrice = latestOffer.offerAmount;
  conversation.messages.push(systemMessage(`Offer accepted at $${latestOffer.offerAmount}.`));

  invalidateCache();
  return task;
}

function completeTask(taskId) {
  const task = getTask(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status === "completed") {
    return task;
  }

  task.status = "completed";

  if (task.postedBy === state.currentAccount.id) {
    state.currentAccount.posterStats.completedCount += 1;
  }

  if (task.assignedTo === state.currentAccount.id) {
    state.currentAccount.taskerStats.completedCount += 1;
    state.currentAccount.taskerStats.jobsWon += 1;
  }

  const conversation = state.conversations.find((item) => item.taskId === taskId);
  if (conversation) {
    conversation.messages.push(systemMessage("Task marked as completed."));
  }

  invalidateCache();
  return task;
}

function updateRatingSummary(summary, rating) {
  const total = summary.average * summary.count + rating;
  const count = summary.count + 1;

  return {
    average: Number((total / count).toFixed(1)),
    count
  };
}

function leaveReview(input) {
  const existing = state.reviews.find(
    (review) =>
      review.taskId === input.taskId &&
      review.revieweeId === input.revieweeId &&
      review.reviewerId === state.currentAccount.id &&
      review.role === input.role
  );

  if (existing) {
    return existing;
  }

  const review = {
    id: `review-${Date.now()}`,
    taskId: input.taskId,
    reviewerId: state.currentAccount.id,
    revieweeId: input.revieweeId,
    role: input.role,
    rating: input.rating,
    text: input.text,
    createdAt: "Now"
  };

  state.reviews.unshift(review);

  if (input.revieweeId === state.currentAccount.id) {
    if (input.role === "poster") {
      state.currentAccount.posterStats.rating = updateRatingSummary(
        state.currentAccount.posterStats.rating,
        input.rating
      );
    } else {
      state.currentAccount.taskerStats.rating = updateRatingSummary(
        state.currentAccount.taskerStats.rating,
        input.rating
      );
    }
  } else {
    const user = state.users.find((item) => item.id === input.revieweeId);
    if (user) {
      if (input.role === "poster") {
        user.posterRating = updateRatingSummary(user.posterRating, input.rating);
      } else {
        user.taskerRating = updateRatingSummary(user.taskerRating, input.rating);
      }
    }
  }

  const conversation = state.conversations.find((item) => item.taskId === input.taskId);
  if (conversation) {
    conversation.messages.push(systemMessage(`Review left: ${input.rating} stars.`));
  }

  invalidateCache();
  return review;
}

module.exports = {
  refreshFeed,
  createTask,
  openConversation,
  sendMessage,
  acceptLatestOffer,
  completeTask,
  leaveReview
};

import { mockMarketplace } from "@/lib/mock-marketplace";
import { MarketplacePayload, MessageKind, RatingRole } from "@/lib/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Missing API base URL");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchMarketplace(): Promise<MarketplacePayload> {
  try {
    return await requestJson<MarketplacePayload>("/api/marketplace");
  } catch {
    return mockMarketplace;
  }
}

export async function createTaskRequest(input: {
  title: string;
  description: string;
  categoryId: string;
  location: string;
  zipCode: string;
  budget: number;
  timeline: string;
  tags: string[];
}): Promise<MarketplacePayload> {
  return await requestJson<MarketplacePayload>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function openConversationRequest(taskId: string): Promise<{
  conversation: { id: string };
  marketplace: MarketplacePayload;
}> {
  return await requestJson("/api/conversations/open", {
    method: "POST",
    body: JSON.stringify({ taskId })
  });
}

export async function sendMessageRequest(
  conversationId: string,
  input: { text: string; kind?: MessageKind; offerAmount?: number }
): Promise<MarketplacePayload> {
  return await requestJson(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function acceptLatestOfferRequest(
  conversationId: string
): Promise<MarketplacePayload> {
  return await requestJson(`/api/conversations/${conversationId}/accept-offer`, {
    method: "POST"
  });
}

export async function completeTaskRequest(taskId: string): Promise<MarketplacePayload> {
  return await requestJson(`/api/tasks/${taskId}/complete`, {
    method: "POST"
  });
}

export async function leaveReviewRequest(input: {
  taskId: string;
  revieweeId: string;
  role: RatingRole;
  rating: number;
  text: string;
}): Promise<MarketplacePayload> {
  return await requestJson("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

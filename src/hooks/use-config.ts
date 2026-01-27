import { toast } from "sonner";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { safeErrorString } from "@/lib/errors";
import { listChats } from "@/lib/invoke";
import type { ChatMetadata } from "@/types/chat-metadata";

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "getInitialState" | "subscribe">;
type ReadonlyStore<T> = UseBoundStore<ReadonlyStoreApi<T>>;

async function fetchChats() {
  try {
    return await listChats();
  } catch (error) {
    toast.error("读取对话列表失败", {
      description: safeErrorString(error),
      closeButton: true,
    });
  }
}

interface AppConfig {
  chats: ChatMetadata[];
  init: () => Promise<void>;
  update: () => Promise<void>;
}

export const useConfig: ReadonlyStore<AppConfig> = create((set) => ({
  chats: [],
  init: async () => {
    const chats = await fetchChats();
    if (chats) set({ chats });
  },
  update: async () => {
    const chats = await fetchChats();
    if (chats) set({ chats });
  },
}));

import { toast } from "sonner";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { safeErrorString } from "@/lib/errors";
import { listChats, listPersonas } from "@/lib/invoke";
import { Persona } from "@/lib/persona";
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
  return [];
}

async function fetchPersonas() {
  try {
    const personas = await listPersonas();
    return personas.map((it) => new Persona(it));
  } catch (error) {
    toast.error("获取 Persona 列表失败", {
      description: safeErrorString(error),
      closeButton: true,
    });
  }
  return [];
}

interface AppConfig {
  chats: ChatMetadata[];
  personas: Persona[];
  init: () => Promise<void>;
  update: () => Promise<void>;
}

export const useConfig: ReadonlyStore<AppConfig> = create((set) => ({
  chats: [],
  personas: [],
  init: async () => {
    const [chats, personas] = await Promise.all([fetchChats(), fetchPersonas()]);
    set({ chats, personas });
  },
  update: async () => {
    const chats = await fetchChats();
    if (chats) set({ chats });
  },
}));

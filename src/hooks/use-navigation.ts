import { createIdGenerator, type LanguageModelUsage } from "ai";
import { toast } from "sonner";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { safeErrorString } from "@/lib/errors";
import { loadChat } from "@/lib/invoke";
import type { DisplayMessage } from "@/types/message";

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "getInitialState" | "subscribe">;
type ReadonlyStore<T> = UseBoundStore<ReadonlyStoreApi<T>>;

type MessagesSetter = (messages: DisplayMessage[]) => void;

const idGenerator = createIdGenerator({ prefix: "chat" });

interface NavId {
  id: string;
  requireLoading: boolean;
  loading: boolean;
  usage?: LanguageModelUsage;
  /** 文件的总结缓存 */
  files: Readonly<Record<string, string>>;
  checkpoint: number;

  newChat: () => void;
  loadChat: (id: string) => void;
  updateUsage: (id: string, usage: LanguageModelUsage) => void;
  updateFile: (id: string, key: string, value: string) => void;
  updateCheckpoint: (id: string, value: number) => void;
  loadMessages: (setter: MessagesSetter) => Promise<void>;
}

export const useNavigation: ReadonlyStore<NavId> = create((set, get) => ({
  id: idGenerator(),
  requireLoading: false,
  loading: false,
  files: {},
  checkpoint: 0,

  newChat: () => {
    const id = idGenerator();
    set({ id, requireLoading: false, loading: false, usage: undefined, files: {}, checkpoint: 0 });
  },

  loadChat: (id) => {
    set({ id, requireLoading: true, loading: false, usage: undefined, files: {}, checkpoint: 0 });
  },

  updateUsage: (id, usage) => {
    if (id !== get().id) return;
    set({ usage });
  },

  updateFile: (id, key, value) => {
    if (id !== get().id) return;
    set((status) => ({ files: { ...status.files, [key]: value } }));
  },

  updateCheckpoint: (id, checkpoint) => {
    if (id !== get().id) return;
    set({ checkpoint });
  },

  loadMessages: async (setter) => {
    const capturedId = get().id;
    set({ requireLoading: false, loading: true });

    try {
      const messages = await loadChat(capturedId);

      // 防止在拉取对话期间点击其他对话造成状态不一致
      if (capturedId === get().id) {
        setter(messages);
        set({ checkpoint: messages.length });
      }
    } catch (error) {
      toast.error("载入对话失败", {
        description: safeErrorString(error),
        closeButton: true,
      });
    } finally {
      // 防止在拉取对话期间点击其他对话造成状态不一致
      if (capturedId === get().id) {
        set({ loading: false });
      }
    }
  },
}));

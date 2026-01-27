import { createIdGenerator, type LanguageModelUsage } from "ai";
import { create, type StoreApi, type UseBoundStore } from "zustand";

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "getInitialState" | "subscribe">;
type ReadonlyStore<T> = UseBoundStore<ReadonlyStoreApi<T>>;

const idGenerator = createIdGenerator({ prefix: "chat" });

interface NavId {
  id: string;
  loading: boolean | Error;
  usage?: LanguageModelUsage;
  /** 文件的总结缓存 */
  files: Readonly<Record<string, string>>;

  newChat: () => void;
  loadChat: (id: string) => void;
  updateLoading: (id: string, loading: boolean | Error) => void;
  updateUsage: (id: string, usage: LanguageModelUsage) => void;
  updateFile: (id: string, key: string, value: string) => void;
}

export const useNavigation: ReadonlyStore<NavId> = create((set, get) => ({
  id: idGenerator(),
  requireLoading: false,
  loading: false,
  files: {},
  checkpoint: 0,

  newChat: () => {
    const id = idGenerator();
    set({ id, loading: false, usage: undefined, files: {} });
  },

  loadChat: (id) => {
    set({ id, loading: true, usage: undefined, files: {} });
  },

  updateLoading: (id, loading) => {
    if (id !== get().id) return;
    set({ loading });
  },

  updateUsage: (id, usage) => {
    if (id !== get().id) return;
    set({ usage });
  },

  updateFile: (id, key, value) => {
    if (id !== get().id) return;
    set((status) => ({ files: { ...status.files, [key]: value } }));
  },
}));

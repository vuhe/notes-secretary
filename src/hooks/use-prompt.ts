import { type ChatRequestOptions, createIdGenerator, type FileUIPart } from "ai";
import { toast } from "sonner";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { useNavigation } from "@/hooks/use-navigation";
import type { SendMessageOptionBody } from "@/lib/agent";
import { safeErrorString } from "@/lib/errors";
import { uploadFile } from "@/lib/invoke";
import type { Persona } from "@/lib/persona";

const fileId = createIdGenerator({ prefix: "file" });

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getState" | "getInitialState" | "subscribe">;
type ReadonlyStore<T> = UseBoundStore<ReadonlyStoreApi<T>>;

export interface AttachmentPart {
  id: string;
  type: "attachment";
  file: File;
}

type SubmittedMessagePart = { text: string; files?: FileUIPart[] } | { files: FileUIPart[] };

interface SubmittedPart {
  message: SubmittedMessagePart;
  options?: ChatRequestOptions;
}

interface PromptContext {
  persona?: Persona;
  text: string;
  files: AttachmentPart[];

  selectPersona: (value: Persona) => void;
  changeText: (value: string) => void;
  addFiles: (files: File[] | FileList) => void;
  addNote: (title: string, content: string) => void;
  removeFile: (id: string) => void;
  submit: (chatId: string) => Promise<SubmittedPart | undefined>;
}

export const usePrompt: ReadonlyStore<PromptContext> = create((set, get) => ({
  text: "",
  files: [],

  selectPersona: (persona) => {
    set({ persona });
  },

  changeText: (text) => {
    set({ text });
  },

  addFiles: (list) => {
    try {
      const files = Array.from(list);
      const parts = files.map((file): AttachmentPart => {
        return { id: fileId(), type: "attachment", file };
      });
      set((it) => ({ files: it.files.concat(parts) }));
    } catch (error) {
      toast.error("读取文件失败", {
        description: safeErrorString(error),
        closeButton: true,
      });
    }
  },

  addNote: (title, content) => {
    const part: AttachmentPart = {
      id: fileId(),
      type: "attachment",
      file: new File([content], `${title}.md`, { type: "text/markdown" }),
    };
    set((it) => ({ files: it.files.concat([part]) }));
  },

  removeFile: (id) => {
    set((it) => ({ files: it.files.filter((f) => f.id !== id) }));
  },

  submit: async (chatId) => {
    const persona = get().persona;
    if (!persona) return undefined;

    const text = get().text;
    const attachments = get().files;

    // 是否上传了不支持的文件筛查
    for (const file of attachments) {
      // TODO: 需要检查是否有文档总结 AI
      // biome-ignore lint/nursery/useAwaitThenable: 误报
      const isSupportedFile = (await persona.supportedFile(file.file.type)) || false;
      if (!isSupportedFile) {
        throw new Error(`模型不支持 '${file.file.name}' 文件且无法转换为文本摘要`);
      }
    }

    const files = await Promise.all(
      attachments.map(async (file): Promise<FileUIPart> => {
        const url = await uploadFile({ chatId, fileId: file.id, file: file.file });
        return {
          type: "file",
          mediaType: file.file.type,
          filename: file.file.name,
          url,
        };
      }),
    );

    const options: ChatRequestOptions = {
      metadata: persona,
      body: {
        chatId,
      } as SendMessageOptionBody,
    };

    // 跨跃 await 需要检查当前的对话是否变更
    if (chatId !== useNavigation.getState().id) {
      return undefined;
    }

    const hasText = Boolean(text);
    const hasAttachments = Boolean(attachments.length);

    let message: SubmittedMessagePart | undefined;
    if (hasText) {
      const attachmentFiles = hasAttachments ? files : undefined;
      message = { text: text, files: attachmentFiles };
    } else if (hasAttachments) {
      message = { files };
    }
    if (message) {
      set({ text: "", files: [] });
      return { message, options };
    }
    return undefined;
  },
}));

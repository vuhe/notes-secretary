import type { FetchFunction } from "@ai-sdk/provider-utils";
import { z } from "zod";
import type { ChatMetadata } from "@/types/chat-metadata";
import type { DisplayMessage } from "@/types/message";
import { PersonaSchema } from "@/types/persona-params";

export const proxy = ((input, init) => {
  let originalUrl: string;

  // 1. 提取原始 URL 字符串
  if (input instanceof Request) {
    originalUrl = input.url;
  } else if (input instanceof URL) {
    originalUrl = input.toString();
  } else {
    originalUrl = input;
  }

  // 2. 构造新的目标 URL
  // 使用 encodeURIComponent 确保原 URL 中的 ? 和 & 不会干扰外层解析
  const proxyUrl = `/api/chat?url=${encodeURIComponent(originalUrl)}`;

  // 3. 执行 fetch
  // 如果 input 是 Request 对象，我们需要创建一个新的 Request 副本并修改 URL
  if (input instanceof Request) {
    return fetch(new Request(proxyUrl, input));
  }

  // 如果是字符串或 URL，直接透传 init 参数即可
  return fetch(proxyUrl, init);
}) as FetchFunction;

export async function listPersonas() {
  const response = await fetch("/api/personas");
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
  // biome-ignore lint/nursery/useAwaitThenable: 误报
  const personas: unknown[] = await response.json();
  return personas.map((it) => {
    const result = PersonaSchema.safeParse(it);
    if (result.success) return result.data;
    throw z.prettifyError(result.error);
  });
}

export async function listChats() {
  const response = await fetch("/api/list");
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
  // biome-ignore lint/nursery/useAwaitThenable: 误报
  const chats: ChatMetadata[] = await response.json();
  return chats;
}

export async function loadChat(id: string) {
  const response = await fetch(`/api/load/${id}`);
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
  // biome-ignore lint/nursery/useAwaitThenable: 误报
  const messages: DisplayMessage[] = await response.json();
  return messages;
}

export async function saveChat(id: string, messages: DisplayMessage[]) {
  const response = await fetch(`/api/save/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages, null, 2),
  });
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
}

interface UploadFileProps {
  chatId: string;
  fileId: string;
  file: File;
}

export async function uploadFile(props: UploadFileProps) {
  const url = `/api/files/${props.chatId}/${props.fileId}`;

  const formData = new FormData();
  formData.append("file", props.file);
  formData.append("fileId", props.fileId);
  formData.append("chatId", props.chatId);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);

  return url;
}

export async function fetchFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.statusText}`);
  return response.arrayBuffer();
}

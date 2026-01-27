import {
  type ChatRequestOptions,
  type ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  type UIMessageChunk,
} from "ai";
import { toast } from "sonner";
import { useConfig } from "@/hooks/use-config";
import { useNavigation } from "@/hooks/use-navigation";
import { safeErrorString } from "@/lib/errors";
import { fetchFile, saveChat } from "@/lib/invoke";
import type { Persona } from "@/lib/persona";
import type { DisplayMessage } from "@/types/message";

type SendMessageOption = {
  trigger: "submit-message" | "regenerate-message";
  chatId: string;
  messageId: string | undefined;
  messages: DisplayMessage[];
  abortSignal: AbortSignal | undefined;
} & ChatRequestOptions;

type ReconnectOption = {
  chatId: string;
} & ChatRequestOptions;

export interface SendMessageOptionBody {
  chatId: string;
}

async function readChatFile(chatId: string, url: string) {
  const chat = useNavigation.getState();
  let summary: string | undefined;
  if (chat.id === chatId) {
    summary = chat.files[url];
  }
  if (summary) {
    return summary;
  }
  return fetchFile(url);
}

/** 转换对话记录 */
async function convertMessages(chatId: string, messages: DisplayMessage[]) {
  const inputMessages: DisplayMessage[] = [];
  for (const message of messages) {
    const parts: DisplayMessage["parts"] = [];
    for (const part of message.parts) {
      if (part.type === "file" && part.url.startsWith("/api/files/")) {
        const data = await readChatFile(chatId, part.url);
        if (typeof data === "string") {
          const filename = part.filename ? ` '${part.filename}' ` : "";
          parts.push({
            type: "data-file",
            data: {
              type: "text",
              text: `经 AI 总结提取，文件${filename}内容为：\n\n${data}`,
              ...(part.providerMetadata ? { providerOptions: part.providerMetadata } : {}),
            },
          });
        } else {
          parts.push({
            type: "data-file",
            data: {
              type: "file",
              data: data,
              filename: part.filename,
              mediaType: part.mediaType,
              ...(part.providerMetadata ? { providerOptions: part.providerMetadata } : {}),
            },
          } as const);
        }
      } else {
        parts.push(part);
      }
    }
    inputMessages.push({
      ...message,
      parts,
    });
  }

  return convertToModelMessages<DisplayMessage>(inputMessages, {
    convertDataPart: (it) => {
      switch (it.type) {
        // 未来可能会增加定义
        case "data-file":
          return it.data;
        default:
          return undefined;
      }
    },
  });
}

export class Agent implements ChatTransport<DisplayMessage> {
  async sendMessages(options: SendMessageOption): Promise<ReadableStream<UIMessageChunk>> {
    const params = options.body as SendMessageOptionBody;
    if (useNavigation.getState().id !== params.chatId) throw Error("chat change!");

    const model = options.metadata as Persona;

    const result = streamText({
      model: model.model,
      maxOutputTokens: model.maxOutputTokens,
      temperature: model.temperature,
      topP: model.topP,
      topK: model.topK,
      presencePenalty: model.presencePenalty,
      frequencyPenalty: model.frequencyPenalty,
      system: model.systemPrompt,
      messages: await convertMessages(params.chatId, options.messages),
      abortSignal: options.abortSignal,
      onStepFinish: (it) => {
        useNavigation.getState().updateUsage(params.chatId, it.usage);
      },
    });

    return createUIMessageStream({
      async execute({ writer }) {
        // TODO: 将 writer 传入 tool 用于在工具中发送状态
        writer.merge(result.toUIMessageStream());
      },
      onError: safeErrorString,
      originalMessages: options.messages,
      onFinish: async ({ messages }) => {
        try {
          await saveChat(params.chatId, messages);
          void useConfig.getState().update();
          if (useNavigation.getState().id === params.chatId) {
            toast.info("对话已保存", {
              closeButton: true,
            });
          }
        } catch (error) {
          if (useNavigation.getState().id === params.chatId) {
            toast.warning("对话保存失败", {
              description: safeErrorString(error),
              closeButton: true,
            });
          }
        }
      },
    });
  }

  reconnectToStream(_: ReconnectOption) {
    return Promise.resolve(null);
  }
}

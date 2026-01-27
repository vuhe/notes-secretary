import type { FilePart, TextPart, UIMessage } from "ai";

type MessageDataPart = {
  file: FilePart | TextPart;
};

export type DisplayMessage = UIMessage<unknown, MessageDataPart>;

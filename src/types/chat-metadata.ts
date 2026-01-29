import { z } from "zod";

export const ChatMetadataSchema = z.object({
  id: z.string().trim().min(1, "chat Id 不能为空"),
  title: z.string().trim().min(1, "标题不能为空"),
});

export type ChatMetadata = z.infer<typeof ChatMetadataSchema>;

import { z } from "zod";

export const PersonaSchema = z.object({
  id: z.string().trim().min(1, "Persona 名称不能为空"),
  provider: z.enum(["deepseek"], {
    error: (issue) => {
      const provider = typeof issue.input === "string" ? issue.input : "Unknown";
      return `此版本不支持 ${provider} 提供商`;
    },
  }),
  model: z.string().trim().min(1, "模型不能为空"),
  apiKey: z.string().trim().min(1, "Api Key 不能为空"),
  baseUrl: z.url().optional(),
  maxTokens: z.int().positive("窗口上下文应为正整数"),

  maxOutputTokens: z.int().positive("最大输出应为正整数").optional(),
  temperature: z.number().min(0, "温度应 ≥ 0").max(2, "温度应 ≤ 2").optional(),
  topP: z.number().min(0, "核采样应 ≥ 0").max(1, "核采样应 ≤ 1").optional(),
  topK: z.int().positive("top-K 应 > 0").max(100, "top-K 应 ≤ 100").optional(),
  presencePenalty: z.number().min(-2, "话题新鲜度应 ≥ -2").max(2, "话题新鲜度应 ≤ 2").optional(),
  frequencyPenalty: z.number().min(-2, "频率惩罚度应 ≥ -2").max(2, "频率惩罚度应 ≤ 2").optional(),

  systemPrompt: z.string(),
});

export type PersonaParams = z.infer<typeof PersonaSchema>;

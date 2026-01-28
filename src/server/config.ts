import { dirname } from "node:path";
import Bun from "bun";
import { z } from "zod";
import { safeErrorString } from "@/lib/errors";
import { type PersonaParams, PersonaSchema } from "@/types/persona-params";

const PersonaConfig = PersonaSchema.omit({ id: true });

const ConfigSchema = z.object({
  summarizer: PersonaConfig.optional(),
  personas: z
    .record(z.string().trim().min(1, "Persona 名称不能为空"), PersonaConfig)
    .refine((obj) => Object.keys(obj).length > 0, "至少需要定义一个 Persona"),
});

// config path 检查
const configPath = Bun.env.SECRETARY_CONFIG_PATH;
if (!configPath) {
  console.error("未配置 SECRETARY_CONFIG_PATH");
  process.exit(1);
}

const configDir = dirname(configPath);
console.log("数据保存在: ", configDir);

// 解析 config
let result: ReturnType<typeof ConfigSchema.safeParse> | undefined;
try {
  const file = Bun.file(configPath);
  // biome-ignore lint/nursery/useAwaitThenable: 误报
  const text = await file.text();
  const config = Bun.TOML.parse(text);
  result = ConfigSchema.safeParse(config);
} catch (error) {
  console.error("读取配置文件失败：\n", safeErrorString(error));
  process.exit(1);
}

if (!result.success) {
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

const config = result.data;
const summarizer: PersonaParams | undefined = config.summarizer
  ? { ...config.summarizer, id: "summarizer" }
  : undefined;
const personas = Object.entries(config.personas).map(([key, value]) => ({ ...value, id: key }));

export { configDir, summarizer, personas };

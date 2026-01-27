import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";
import { proxy } from "@/lib/invoke";
import type { PersonaParams } from "@/types/persona-params";

const SystemPromptPrefix = `输出应遵循 GitHub Flavored Markdown，部分输出渲染需要符合以下约定的：

1. **行内公式**：请使用两个美元符号 **$$...$$** 包裹，且公式前后不换行。  
   示例：这是质能方程 $$E = mc^{2}$$ 的应用。

2. **单行公式**：请使用两个美元符号 **$$...$$** 包裹，并确保公式独立成行（前后换行）。  
   示例：  
   $$
   E = mc^{2}
   $$

3. **流程图**：使用 Mermaid 代码块（\`\`\`mermaid ... \`\`\`）绘制。

4. **Github Alert**：支持 NOTE、TIP、IMPORTANT、WARNING、CAUTION 提示框，
   标题和正文需要隔一行，遵循 GitHub 规范，**仅支持顶层，不支持嵌套 Alert**。  
   示例：  
   > [!NOTE] title
   > 
   > Content

请在所有回答中严格遵守此格式，以确保输出正确显示。

---

`;

export class Persona {
  readonly id: string;
  readonly provider: string;
  readonly model: LanguageModel;

  readonly maxTokens: number;
  readonly maxOutputTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly presencePenalty?: number;
  readonly frequencyPenalty?: number;

  readonly systemPrompt: string;

  private supportedUrls: PromiseLike<Record<string, RegExp[]>> | Record<string, RegExp[]>;

  constructor(params: PersonaParams) {
    this.id = params.id;
    this.maxTokens = params.maxTokens;
    this.provider = params.provider;

    const modelId = params.model;
    const apiKey = params.apiKey;
    const baseURL = params.baseUrl;

    switch (this.provider) {
      case "deepseek": {
        const model = createDeepSeek({
          apiKey: apiKey,
          baseURL: baseURL,
          fetch: proxy,
        }).languageModel(modelId);
        this.model = model;
        this.supportedUrls = model.supportedUrls;
        break;
      }
      default:
        throw new Error(`此版本不支持 ${this.provider} 提供商`);
    }

    // TODO: 如果要全部执行文件优化则应该设置 supportedUrls 为 {}

    this.maxOutputTokens = params.maxOutputTokens;
    this.temperature = params.temperature;
    this.topP = params.topP;
    this.topK = params.topK;
    this.presencePenalty = params.presencePenalty;
    this.frequencyPenalty = params.frequencyPenalty;
    this.systemPrompt = `${SystemPromptPrefix}\n${params.systemPrompt}`;
  }

  async supportedFile(mimeType: string) {
    // biome-ignore lint/nursery/useAwaitThenable: supportedUrls 可能是 Promise
    const supported = await this.supportedUrls;
    this.supportedUrls = supported; // 避免多次重复调用昂贵的计算函数
    const supportedTypes = Object.keys(supported);
    for (const pattern of supportedTypes) {
      if (pattern.trim() === "" || pattern === "*/*") {
        return true;
      }
      if (pattern.endsWith("/*")) {
        const prefix = pattern.slice(0, -1); // e.g: image/* -> image/
        if (mimeType.startsWith(prefix)) {
          return true;
        }
      } else if (mimeType === pattern) {
        return true;
      }
    }
    return false;
  }
}

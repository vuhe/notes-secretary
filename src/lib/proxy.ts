import type { FetchFunction } from "@ai-sdk/provider-utils";

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

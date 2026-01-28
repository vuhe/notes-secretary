import { safeErrorString } from "@/lib/errors";
import { personas } from "@/server/config";
import type { ChatMetadata } from "@/types/chat-metadata";

export async function personasRequest() {
  return Response.json(personas);
}

export async function chatRequest(req: Request) {
  // 从查询参数获取被编码的原始目标 URL
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) return new Response("Missing url parameter", { status: 400 });

  // 直接利用 req (Request对象) 来构造新的请求
  const proxyRequest = new Request(targetUrl, req);

  // 转发给外部 API 时，这些必须被重置，否则**可能**会被对方拒绝
  proxyRequest.headers.delete("host");
  proxyRequest.headers.delete("origin");
  proxyRequest.headers.delete("referer");

  try {
    return await fetch(proxyRequest);
  } catch (e) {
    return new Response(`Proxy Error: ${safeErrorString(e)}`, { status: 500 });
  }
}

export async function listRequest() {
  // TODO: 查找文件夹并返回对话的信息
  const list: ChatMetadata[] = [{ id: "test", title: "test" }];
  return Response.json(list);
}

export async function loadRequest(_id: string) {
  // TODO
  return new Response("Not Found", { status: 404 });
}

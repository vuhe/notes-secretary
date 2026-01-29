/** biome-ignore-all lint/nursery/useAwaitThenable: 误报 */
import { join } from "node:path";
import Bun from "bun";
import mime from "mime-types";
import { safeErrorString } from "@/lib/errors";
import { configDir, personas } from "@/server/config";
import type { ChatMetadata } from "@/types/chat-metadata";

export function personasRequest() {
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

export async function loadRequest(id: string) {
  try {
    const path = join(configDir, id, "messages.json");
    const file = Bun.file(path);
    if (!(await file.exists())) return new Response("Not Found", { status: 404 });
    return new Response(file.stream(), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(safeErrorString(error), { status: 500 });
  }
}

export async function saveRequest(id: string, body: Promise<ArrayBufferLike>) {
  try {
    const path = join(configDir, id, "messages.json");
    await Bun.write(path, await body);
    return new Response();
  } catch (error) {
    return new Response(safeErrorString(error), { status: 500 });
  }
}

export async function fileRequest(chatId: string, fileId: string, form?: Promise<FormData>) {
  try {
    const path = join(configDir, chatId, fileId);

    // 存在提交数据的话为 POST
    if (form) {
      const formData = await form;
      const file = formData.get("file") as File;
      await Bun.write(path, await file.arrayBuffer());
      return new Response();
    }

    const file = Bun.file(path);
    if (!(await file.exists())) return new Response("Not Found", { status: 404 });
    const mediaType = mime.lookup(path) || "application/octet-stream";
    return new Response(file.stream(), { headers: { "Content-Type": mediaType } });
  } catch (error) {
    return new Response(safeErrorString(error), { status: 500 });
  }
}

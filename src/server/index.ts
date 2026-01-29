import Bun from "bun";
import {
  chatRequest,
  fileRequest,
  listRequest,
  loadRequest,
  personasRequest,
  saveRequest,
} from "@/server/controller";

Bun.serve({
  port: 3000,
  hostname: "localhost",
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/api")) {
      // persona 相关 api
      if (path === "/api/personas") {
        return personasRequest();
      }

      // 对话相关 api
      if (path === "/api/chat") {
        return chatRequest(req);
      }
      if (path === "/api/list") {
        return listRequest();
      }
      if (path.startsWith("/api/load/")) {
        const id = path.replace("/api/load/", "");
        return loadRequest(id);
      }
      if (path.startsWith("/api/save/")) {
        const id = path.replace("/api/save/", "");
        return saveRequest(id, req.arrayBuffer());
      }

      // 文件相关 api
      if (path.startsWith("/api/files/")) {
        const paths = path.replace("/api/files/", "");
        const [chatId, fileId] = paths.split("/");
        if (req.method === "POST") return fileRequest(chatId, fileId, req.formData());
        return fileRequest(chatId, fileId);
      }

      // 其他请求不应该存在
      return new Response("Not Found", { status: 404 });
    }

    if (process.env.NODE_ENV === "production") {
      // 生产环境：读取 dist 目录，默认为 index.html
      const filePath = path === "/" ? "/index.html" : path;
      const file = Bun.file(`./dist${filePath}`);
      // biome-ignore lint/nursery/useAwaitThenable: 误报
      return (await file.exists())
        ? new Response(file)
        : new Response(Bun.file("./dist/index.html"));
    }

    // 开发环境：这里通常让 Vite 的 dev server 来接管，
    return new Response("开发模式下请通过 Vite 端口访问", { status: 503 });
  },
});

console.log("Server running at http://localhost:3000");

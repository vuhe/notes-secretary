import Bun from "bun";
import { chatRequest } from "@/server/controller";

Bun.serve({
  port: 3000,
  hostname: "localhost",
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/api")) {
      switch (path) {
        case "/api/chat":
          return chatRequest(req);
        default:
          return new Response("Not Found", { status: 404 });
      }
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

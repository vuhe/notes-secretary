import Bun from "bun";

Bun.serve({
  port: 3000,
  hostname: "localhost",
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/api")) {
      if (path === "/api/hello") {
        return Response.json({ message: "Hello from Bun API!" });
      }
      return new Response("Not Found", { status: 404 });
    }

    // 默认为 index.html
    if (process.env.NODE_ENV === "production") {
      // 生产环境：读取 dist 目录
      const filePath = path === "/" ? "/index.html" : path;
      const file = Bun.file(`./dist${filePath}`);
      return (await file.exists())
        ? new Response(file)
        : new Response(Bun.file("./dist/index.html"));
    }

    // 开发环境：这里通常让 Vite 的 dev server 来接管，
    // 或者如果你用 Bun 原生构建，可以使用 Bun.build 的产物
    return new Response("请在开发模式下通过 Vite 端口访问", { status: 503 });
  },
});

console.log("Server running at http://localhost:3000");

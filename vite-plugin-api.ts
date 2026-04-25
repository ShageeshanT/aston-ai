import type { Plugin } from "vite";
import path from "node:path";
import fs from "node:fs";

// Lightweight dev-only plugin that makes /api/*.ts files behave like
// Vercel serverless functions during `npm run dev`. Each file must export
// a default `(req: Request) => Response | Promise<Response>` handler.
export function apiPlugin(apiDir = "api"): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const route = req.url.split("?")[0].replace(/^\/api\//, "");
        const filePath = path.resolve(apiDir, `${route}.ts`);
        if (!fs.existsSync(filePath)) return next();

        try {
          const mod = await server.ssrLoadModule(filePath);
          const handler = mod.default as (req: Request) => Promise<Response> | Response;
          if (typeof handler !== "function") return next();

          // Build a Web Request from the Node IncomingMessage.
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const bodyBuf = chunks.length ? Buffer.concat(chunks) : undefined;

          const host = req.headers.host || "localhost";
          const url = `http://${host}${req.url}`;

          // Headers: filter out undefined values.
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (Array.isArray(v)) headers.set(k, v.join(", "));
            else if (typeof v === "string") headers.set(k, v);
          }

          const init: RequestInit = {
            method: req.method,
            headers,
            body: bodyBuf && req.method !== "GET" && req.method !== "HEAD"
              ? bodyBuf
              : undefined,
          };
          // Node requires duplex: 'half' when there's a body.
          if (init.body) (init as any).duplex = "half";

          const webReq = new Request(url, init);
          const webRes = await handler(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((v, k) => res.setHeader(k, v));

          if (webRes.body) {
            const reader = webRes.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
              // flush — critical for streaming
              // @ts-expect-error — flush exists on zlib/http response in some stacks
              if (typeof res.flush === "function") res.flush();
            }
          }
          res.end();
        } catch (err) {
          console.error(`[api] ${route} failed:`, err);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
            }),
          );
        }
      });
    },
  };
}

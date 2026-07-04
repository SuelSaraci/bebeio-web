import express from "express";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const distPath = join(__dirname, "dist");

if (!existsSync(join(distPath, "index.html"))) {
  console.error("dist/index.html not found — run yarn build first");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paddle.com https://cdn.paddle.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https: wss:",
        "frame-src https://*.paddle.com",
      ].join("; "),
    );
    next();
  });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/assets",
  express.static(join(distPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }),
);

app.use(
  express.static(distPath, {
    maxAge: "1h",
    index: false,
  }),
);

app.get("*", (_req, res) => {
  const html = readFileSync(join(distPath, "index.html"), "utf8");
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(html);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bebio web running on port ${PORT}`);
});

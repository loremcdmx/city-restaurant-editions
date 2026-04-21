import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const rootDir = resolve(process.cwd(), process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? process.env.PORT ?? 3107);

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveRequestPath(urlPathname) {
  const sanitizedPath = normalize(decodeURIComponent(urlPathname))
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const candidates = [
    join(rootDir, sanitizedPath),
    join(rootDir, `${sanitizedPath}.html`),
    join(rootDir, sanitizedPath, "index.html"),
  ];

  if (sanitizedPath === "") {
    candidates.unshift(join(rootDir, "index.html"));
  }

  for (const candidate of candidates) {
    if (!(await fileExists(candidate))) {
      continue;
    }

    const candidateStat = await stat(candidate);

    if (candidateStat.isFile()) {
      return candidate;
    }
  }

  const notFoundPage = join(rootDir, "404.html");
  if (await fileExists(notFoundPage)) {
    return notFoundPage;
  }

  return null;
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const resolvedPath = await resolveRequestPath(requestUrl.pathname);

  if (!resolvedPath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = extname(resolvedPath).toLowerCase();
  const contentType =
    CONTENT_TYPES[extension] ?? "application/octet-stream";
  const isHtml = extension === ".html";
  const isNotFoundPage = resolvedPath.endsWith(`${join("", "404.html")}`);

  response.writeHead(isNotFoundPage ? 404 : 200, {
    "Content-Type": contentType,
    "Cache-Control": isHtml
      ? "no-cache"
      : "public, max-age=31536000, immutable",
  });

  createReadStream(resolvedPath).pipe(response);
});

server.listen(port, () => {
  console.log(`Static server ready at http://localhost:${port}`);
});

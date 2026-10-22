export function fail(status, message) {
  return Object.assign(new Error(message), { status });
}

export function allowedOrigin(origin) {
  const list = (process.env.CORS_ORIGIN || "http://localhost:3000,https://citadel-pink.vercel.app")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return origin && list.includes(origin) ? origin : list[0];
}

export function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin),
    Vary: "Origin",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, X-Citadel-Signature",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  };
}

export function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders(res.citadelOrigin) });
  res.end(status === 204 ? "" : JSON.stringify(body));
}

export function assertRole(user, roles) {
  if (!user) throw fail(401, "Sign in required.");
  if (!roles.includes(user.role)) throw fail(403, "You cannot do that.");
}

export function matchPath(pattern, pathname) {
  const names = [];
  const source = pattern.replace(/:([A-Za-z]+)/g, (_, name) => {
    names.push(name);
    return "([^/]+)";
  });
  const found = pathname.match(new RegExp(`^${source}$`));
  if (!found) return null;
  return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(found[index + 1])]));
}

export function readRaw(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(fail(413, "Body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function readJson(req) {
  const raw = await readRaw(req);
  if (!raw.length) return {};
  try {
    return JSON.parse(raw.toString());
  } catch {
    throw fail(400, "Invalid JSON.");
  }
}

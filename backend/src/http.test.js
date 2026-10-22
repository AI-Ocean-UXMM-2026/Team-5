import assert from "node:assert/strict";
import test from "node:test";
import { allowedOrigin } from "./http.js";

test("cors echoes only an allowed origin", () => {
  const previous = process.env.CORS_ORIGIN;
  process.env.CORS_ORIGIN = "http://localhost:3000,https://citadel-pink.vercel.app";
  try {
    assert.equal(allowedOrigin("https://citadel-pink.vercel.app"), "https://citadel-pink.vercel.app");
    assert.equal(allowedOrigin("http://localhost:3000"), "http://localhost:3000");
    assert.equal(allowedOrigin("https://evil.example"), "http://localhost:3000");
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});

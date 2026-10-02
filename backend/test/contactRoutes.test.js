const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");

process.env.JWT_SECRET = "contact-route-test-secret";
const app = require("../src/app");

test("GET /api/contacts requires authentication", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/contacts`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, "Not authorized, token missing.");
});

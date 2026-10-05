const test = require("node:test");
const assert = require("node:assert/strict");
const { protect } = require("../src/middleware/authMiddleware");
const { stack } = require("../src/routes/adminRoutes");

test("admin routes use the exported protect auth middleware before admin authorization", () => {
  assert.equal(stack[0].handle, protect);
});

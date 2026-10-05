const test = require("node:test");
const assert = require("node:assert/strict");
const { protect } = require("../src/middleware/authMiddleware");
const contactRoutes = require("../src/routes/contactRoutes");

test("contact routes attach authentication middleware before CRUD handlers", () => {
  assert.equal(contactRoutes.stack[0].handle, protect);
});

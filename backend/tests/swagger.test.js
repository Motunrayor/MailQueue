const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

test("OpenAPI documentation is public and describes authentication", async () => {
  const response = await request(app).get("/api-docs.json");
  assert.equal(response.status, 200);
  assert.equal(response.body.openapi, "3.0.3");
  assert.equal(response.body.components.securitySchemes.bearerAuth.scheme, "bearer");
  assert.deepEqual(response.body.paths["/auth/login"].post.security, []);
  assert.deepEqual(response.body.security, [{ bearerAuth: [] }]);
  assert.equal(response.body.servers[0].url, "/");
});

test("Swagger UI and its local assets are publicly available", async () => {
  const page = await request(app).get("/api-docs/");
  assert.equal(page.status, 200);
  assert.match(page.text, /swagger-ui/);
  const asset = await request(app).get("/api-docs/swagger-ui-bundle.js");
  assert.equal(asset.status, 200);
  const init = await request(app).get("/api-docs/swagger-ui-init.js");
  assert.equal(init.status, 200);
  assert.match(init.text, /\/api-docs.json/);
});

test("the specification covers every mounted API operation", async () => {
  const response = await request(app).get("/api-docs.json");
  assert.equal(response.status, 200);
  const mounts = {
    "/auth": require("../src/routes/authRoutes"),
    "/user": require("../src/routes/userRoutes"),
    "/contacts": require("../src/routes/contactRoutes"),
    "/campaigns": require("../src/routes/campaignRoutes"),
    "/admin": require("../src/routes/adminRoutes"),
  };
  for (const [prefix, router] of Object.entries(mounts)) {
    for (const layer of router.stack) {
      if (!layer.route) continue;
      const path = prefix + (layer.route.path === "/" ? "" : layer.route.path.replace(/:id/g, "{id}"));
      for (const method of Object.keys(layer.route.methods)) {
        assert.ok(response.body.paths[path]?.[method], `${method.toUpperCase()} ${path} is documented`);
      }
    }
  }
  assert.ok(response.body.paths["/health"].get);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Campaign = require("../src/models/Campaign");
const Contact = require("../src/models/Contact");
const {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
} = require("../src/controllers/campaignController");

const ownerId = new mongoose.Types.ObjectId();
const campaignId = new mongoose.Types.ObjectId().toString();
const contactId = new mongoose.Types.ObjectId().toString();

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function request(overrides = {}) {
  return {
    user: { _id: ownerId, id: ownerId.toString() },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

test("createCampaign rejects recipients not owned by the authenticated user", async (t) => {
  t.mock.method(Contact, "find", () => ({
    select: async () => [],
  }));
  const res = response();

  await createCampaign(
    request({
      body: {
        name: "Newsletter",
        subject: "Hello",
        message: "Welcome",
        recipients: [contactId],
      },
    }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /recipient/i);
});

test("createCampaign stores only owned recipients and sets totalRecipients", async (t) => {
  let contactFilter;
  let created;
  t.mock.method(Contact, "find", (filter) => {
    contactFilter = filter;
    return {
      select: async () => [{ _id: contactId }],
    };
  });
  t.mock.method(Campaign, "create", async (data) => {
    created = data;
    return { _id: campaignId, ...data };
  });
  const res = response();

  await createCampaign(
    request({
      body: {
        name: "Newsletter",
        subject: "Hello",
        message: "Welcome",
        recipients: [contactId],
      },
    }),
    res,
    assert.fail
  );

  assert.deepEqual(contactFilter, {
    _id: { $in: [contactId] },
    user: ownerId,
  });
  assert.equal(created.totalRecipients, 1);
  assert.deepEqual(created.recipients, [contactId]);
  assert.equal(res.statusCode, 201);
});

test("getCampaigns scopes to owner and applies search, status, and pagination", async (t) => {
  let filter;
  let skipValue;
  let limitValue;
  const campaigns = [{ _id: campaignId, user: ownerId }];

  t.mock.method(Campaign, "find", (receivedFilter) => {
    filter = receivedFilter;
    return {
      sort() {
        return this;
      },
      skip(value) {
        skipValue = value;
        return this;
      },
      limit(value) {
        limitValue = value;
        return this;
      },
      then(resolve) {
        return Promise.resolve(campaigns).then(resolve);
      },
    };
  });
  t.mock.method(Campaign, "countDocuments", async () => 11);
  const res = response();

  await getCampaigns(
    request({ query: { search: "fall", status: "draft", page: "2", limit: "5" } }),
    res,
    assert.fail
  );

  assert.equal(filter.user, ownerId);
  assert.equal(filter.status, "draft");
  assert.ok(filter.$or);
  assert.equal(skipValue, 5);
  assert.equal(limitValue, 5);
  assert.deepEqual(res.body.pagination, {
    total: 11,
    page: 2,
    limit: 5,
    totalPages: 3,
  });
});

test("updateCampaign rejects non-draft campaigns", async (t) => {
  t.mock.method(Campaign, "findOne", async () => ({
    _id: campaignId,
    user: ownerId,
    status: "queued",
  }));
  const res = response();

  await updateCampaign(
    request({ params: { id: campaignId }, body: { name: "Updated" } }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /draft/i);
});

test("updateCampaign allows only editable fields and revalidates recipients", async (t) => {
  let update;
  t.mock.method(Campaign, "findOne", async () => ({
    _id: campaignId,
    user: ownerId,
    status: "draft",
  }));
  t.mock.method(Contact, "find", () => ({
    select: async () => [{ _id: contactId }],
  }));
  t.mock.method(Campaign, "findOneAndUpdate", async (filter, receivedUpdate) => {
    update = receivedUpdate;
    return { _id: campaignId, ...receivedUpdate };
  });
  const res = response();

  await updateCampaign(
    request({
      params: { id: campaignId },
      body: {
        name: " Updated ",
        subject: " Subject ",
        message: " Body ",
        recipients: [contactId],
      },
    }),
    res,
    assert.fail
  );

  assert.deepEqual(update, {
    name: "Updated",
    subject: "Subject",
    message: "Body",
    recipients: [contactId],
    totalRecipients: 1,
  });
  assert.equal(res.statusCode, 200);
});

test("updateCampaign rejects workflow fields supplied by the client", async (t) => {
  t.mock.method(Campaign, "findOne", async () => ({
    _id: campaignId,
    user: ownerId,
    status: "draft",
  }));
  const res = response();

  await updateCampaign(
    request({
      params: { id: campaignId },
      body: { status: "completed", successCount: 50 },
    }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 400);
});

test("deleteCampaign rejects non-draft campaigns", async (t) => {
  t.mock.method(Campaign, "findOne", async () => ({
    _id: campaignId,
    user: ownerId,
    status: "processing",
  }));
  const res = response();

  await deleteCampaign(request({ params: { id: campaignId } }), res, assert.fail);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /draft/i);
});

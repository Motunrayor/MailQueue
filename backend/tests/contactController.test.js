const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Contact = require("../src/models/Contact");
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} = require("../src/controllers/contactController");

const ownerId = new mongoose.Types.ObjectId().toString();
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
    user: { id: ownerId },
    body: {},
    params: {},
    ...overrides,
  };
}

test("createContact creates a normalized contact for the authenticated user", async (t) => {
  let received;
  t.mock.method(Contact, "create", async (data) => {
    received = data;
    return { _id: contactId, ...data };
  });
  const res = response();

  await createContact(
    request({
      body: {
        full_name: "  Ada Lovelace ",
        email: " ADA@EXAMPLE.COM ",
      },
    }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 201);
  assert.deepEqual(received, {
    user: ownerId,
    full_name: "Ada Lovelace",
    email: "ada@example.com",
  });
  assert.equal(res.body.success, true);
  assert.equal(res.body.contact.email, "ada@example.com");
});

test("createContact rejects missing fields", async () => {
  const res = response();

  await createContact(request(), res, assert.fail);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("createContact rejects an invalid email", async () => {
  const res = response();

  await createContact(
    request({ body: { full_name: "Ada", email: "not-an-email" } }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 400);
});

test("createContact returns 409 for a duplicate owner email", async (t) => {
  t.mock.method(Contact, "create", async () => {
    const error = new Error("duplicate");
    error.code = 11000;
    throw error;
  });
  const res = response();

  await createContact(
    request({ body: { full_name: "Ada", email: "ada@example.com" } }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
});

test("getContacts lists only contacts belonging to the authenticated user", async (t) => {
  const contacts = [{ _id: contactId, user: ownerId }];
  let filter;
  let sort;
  t.mock.method(Contact, "find", (receivedFilter) => {
    filter = receivedFilter;
    return {
      sort(receivedSort) {
        sort = receivedSort;
        return this;
      },
      skip() {
        return this;
      },
      limit: async () => {
        return contacts;
      },
    };
  });
  t.mock.method(Contact, "countDocuments", async () => contacts.length);
  const res = response();

  await getContacts(request(), res, assert.fail);

  assert.deepEqual(filter, { user: ownerId });
  assert.deepEqual(sort, { createdAt: -1 });
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.contacts, contacts);
});

test("getContacts forwards database errors", async (t) => {
  const expected = new Error("database unavailable");
  t.mock.method(Contact, "find", () => {
    throw expected;
  });
  t.mock.method(Contact, "countDocuments", async () => 0);
  let received;

  await getContacts(request(), response(), (error) => {
    received = error;
  });

  assert.equal(received, expected);
});

test("getContact scopes lookup by contact id and owner", async (t) => {
  let filter;
  t.mock.method(Contact, "findOne", async (receivedFilter) => {
    filter = receivedFilter;
    return { _id: contactId, user: ownerId };
  });
  const res = response();

  await getContact(request({ params: { id: contactId } }), res, assert.fail);

  assert.deepEqual(filter, { _id: contactId, user: ownerId });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});

test("getContact rejects a malformed id", async () => {
  const res = response();

  await getContact(request({ params: { id: "bad-id" } }), res, assert.fail);

  assert.equal(res.statusCode, 400);
});

test("getContact returns 404 when the owned contact is absent", async (t) => {
  t.mock.method(Contact, "findOne", async () => null);
  const res = response();

  await getContact(request({ params: { id: contactId } }), res, assert.fail);

  assert.equal(res.statusCode, 404);
});

test("updateContact updates only allowed fields on an owned contact", async (t) => {
  let filter;
  let update;
  let options;
  t.mock.method(
    Contact,
    "findOneAndUpdate",
    async (receivedFilter, receivedUpdate, receivedOptions) => {
      filter = receivedFilter;
      update = receivedUpdate;
      options = receivedOptions;
      return { _id: contactId, user: ownerId, ...receivedUpdate };
    }
  );
  const res = response();

  await updateContact(
    request({
      params: { id: contactId },
      body: { full_name: "  Ada Byron ", email: " NEW@EXAMPLE.COM " },
    }),
    res,
    assert.fail
  );

  assert.deepEqual(filter, { _id: contactId, user: ownerId });
  assert.deepEqual(update, {
    full_name: "Ada Byron",
    email: "new@example.com",
  });
  assert.deepEqual(options, { new: true, runValidators: true });
  assert.equal(res.body.success, true);
});

test("updateContact rejects empty and unsupported updates", async () => {
  const emptyResponse = response();
  const unsupportedResponse = response();

  await updateContact(
    request({ params: { id: contactId }, body: {} }),
    emptyResponse,
    assert.fail
  );
  await updateContact(
    request({ params: { id: contactId }, body: { user: "another-user" } }),
    unsupportedResponse,
    assert.fail
  );

  assert.equal(emptyResponse.statusCode, 400);
  assert.equal(unsupportedResponse.statusCode, 400);
});

test("updateContact rejects blank names and invalid emails", async () => {
  const nameResponse = response();
  const emailResponse = response();

  await updateContact(
    request({ params: { id: contactId }, body: { full_name: "   " } }),
    nameResponse,
    assert.fail
  );
  await updateContact(
    request({ params: { id: contactId }, body: { email: "bad" } }),
    emailResponse,
    assert.fail
  );

  assert.equal(nameResponse.statusCode, 400);
  assert.equal(emailResponse.statusCode, 400);
});

test("updateContact returns 404 when the owned contact is absent", async (t) => {
  t.mock.method(Contact, "findOneAndUpdate", async () => null);
  const res = response();

  await updateContact(
    request({ params: { id: contactId }, body: { full_name: "Ada" } }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 404);
});

test("updateContact returns 409 for a duplicate owner email", async (t) => {
  t.mock.method(Contact, "findOneAndUpdate", async () => {
    const error = new Error("duplicate");
    error.code = 11000;
    throw error;
  });
  const res = response();

  await updateContact(
    request({ params: { id: contactId }, body: { email: "ada@example.com" } }),
    res,
    assert.fail
  );

  assert.equal(res.statusCode, 409);
});

test("deleteContact deletes only an owned contact", async (t) => {
  let filter;
  t.mock.method(Contact, "findOneAndDelete", async (receivedFilter) => {
    filter = receivedFilter;
    return { _id: contactId };
  });
  const res = response();

  await deleteContact(request({ params: { id: contactId } }), res, assert.fail);

  assert.deepEqual(filter, { _id: contactId, user: ownerId });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});

test("deleteContact rejects malformed ids and returns 404 for missing contacts", async (t) => {
  const invalidResponse = response();
  await deleteContact(
    request({ params: { id: "bad-id" } }),
    invalidResponse,
    assert.fail
  );

  t.mock.method(Contact, "findOneAndDelete", async () => null);
  const missingResponse = response();
  await deleteContact(
    request({ params: { id: contactId } }),
    missingResponse,
    assert.fail
  );

  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(missingResponse.statusCode, 404);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Contact = require("../src/models/Contact");

test("contact requires an owner, full name, and email", async () => {
  const contact = new Contact({});
  await assert.rejects(contact.validate(), (error) => {
    assert.ok(error.errors.user);
    assert.ok(error.errors.full_name);
    assert.ok(error.errors.email);
    return true;
  });
});

test("contact trims fields and lowercases email", async () => {
  const contact = new Contact({
    user: new mongoose.Types.ObjectId(),
    full_name: "  Ada Lovelace  ",
    email: "  ADA@EXAMPLE.COM  ",
  });

  await contact.validate();
  assert.equal(contact.full_name, "Ada Lovelace");
  assert.equal(contact.email, "ada@example.com");
});

test("contact rejects malformed email addresses", async () => {
  const contact = new Contact({
    user: new mongoose.Types.ObjectId(),
    full_name: "Ada Lovelace",
    email: "not-an-email",
  });

  await assert.rejects(contact.validate(), (error) => {
    assert.ok(error.errors.email);
    return true;
  });
});

test("contact email is unique per owner", () => {
  const indexes = Contact.schema.indexes();
  const ownerEmailIndex = indexes.find(
    ([fields]) => fields.user === 1 && fields.email === 1
  );

  assert.deepEqual(ownerEmailIndex, [
    { user: 1, email: 1 },
    { unique: true },
  ]);
});

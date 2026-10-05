const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Campaign = require("../src/models/Campaign");
const Job = require("../src/models/Job");
const Notification = require("../src/models/Notification");
const emailService = require("../src/services/emailService");
const { processJob } = require("../src/workers/emailWorker");

const campaignId = new mongoose.Types.ObjectId();
const contactId = new mongoose.Types.ObjectId();
const jobId = new mongoose.Types.ObjectId();

test("processJob moves campaign through processing to completed when all jobs are final", async (t) => {
  const updates = [];
  const job = {
    _id: jobId,
    campaign: campaignId,
    contact: contactId,
    recipientEmail: "ada@example.com",
  };

  t.mock.method(Job, "findOneAndUpdate", async () => ({
    ...job,
    _id: jobId,
    status: "processing",
  }));
  t.mock.method(Campaign, "findById", async () => ({
    _id: campaignId,
    name: "Launch",
    subject: "Hello",
    message: "Welcome",
  }));
  t.mock.method(Notification, "findOneAndUpdate", async () => ({}));
  t.mock.method(emailService, "sendCampaignEmail", async () => ({}));
  t.mock.method(Job, "findByIdAndUpdate", async () => ({}));
  t.mock.method(Campaign, "findByIdAndUpdate", async (id, update) => {
    updates.push(update);
    return {};
  });
  t.mock.method(Job, "countDocuments", async () => 0);

  await processJob(job);

  assert.deepEqual(updates[0], { $set: { status: "processing" } });
  assert.deepEqual(updates.at(-1), { $set: { status: "completed" } });
});

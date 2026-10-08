import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const connectDatabase = require("../config/database");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const Campaign = require("../models/Campaign");
const emailService = require("../services/emailService");

const finalizeCampaignIfComplete = async (campaignId) => {
  const activeJobs = await Job.countDocuments({
    campaign: campaignId,
    status: { $in: ["pending", "processing"] },
  });

  if (activeJobs === 0) {
    await Campaign.findByIdAndUpdate(campaignId, {
      $set: {
        status: "completed",
      },
    });
  }
};

const processJob = async (job) => {
  try {
    // Claim the job before processing
    const claimedJob = await Job.findOneAndUpdate(
      {
        _id: job._id,
        status: "pending",
      },
      {
        $set: {
          status: "processing",
        },
      },
      {
        new: true,
      }
    );

    // Another worker/process may have already claimed it
    if (!claimedJob) {
      return;
    }

    await Campaign.findByIdAndUpdate(claimedJob.campaign, {
      $set: {
        status: "processing",
      },
    });

    console.log(`Processing job ${claimedJob._id}`);

    // Get campaign information
    const campaign = await Campaign.findById(claimedJob.campaign);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Update notification to processing
    await Notification.findOneAndUpdate(
      {
        campaign: claimedJob.campaign,
        contact: claimedJob.contact,
        email: claimedJob.recipientEmail,
      },
      {
        $set: {
          status: "processing",
          error: null,
        },
      }
    );

    // Send email
    await emailService.sendCampaignEmail({
      email: claimedJob.recipientEmail,
      subject: campaign.subject,
      message: campaign.message,
      campaignName: campaign.name,
    });
    // Successful job
    await Job.findByIdAndUpdate(claimedJob._id, {
      $set: {
        status: "completed",
        processedAt: new Date(),
        error: null,
      },
    });

    // Successful notification
    await Notification.findOneAndUpdate(
      {
        campaign: claimedJob.campaign,
        contact: claimedJob.contact,
        email: claimedJob.recipientEmail,
      },
      {
        $set: {
          status: "completed",
          sentAt: new Date(),
          error: null,
        },
      }
    );

    // Update campaign counters
    await Campaign.findByIdAndUpdate(claimedJob.campaign, {
      $inc: {
        processedCount: 1,
        successCount: 1,
      },
    });

    await finalizeCampaignIfComplete(claimedJob.campaign);

    console.log(`Job ${claimedJob._id} completed successfully`);
  } catch (error) {
    console.error(`Job ${job._id} failed:`, error.message);

    // Get the latest job state
    const failedJob = await Job.findById(job._id);

    if (!failedJob) {
      return;
    }

    const newAttempts = failedJob.attempts + 1;

    if (newAttempts >= failedJob.maxAttempts) {
      // Permanent failure
      await Job.findByIdAndUpdate(failedJob._id, {
        $set: {
          status: "failed",
          attempts: newAttempts,
          error: error.message,
          processedAt: new Date(),
        },
      });

      await Notification.findOneAndUpdate(
        {
          campaign: failedJob.campaign,
          contact: failedJob.contact,
          email: failedJob.recipientEmail,
        },
        {
          $set: {
            status: "failed",
            error: error.message,
          },
        }
      );

      await Campaign.findByIdAndUpdate(failedJob.campaign, {
        $inc: {
          processedCount: 1,
          failedCount: 1,
        },
      });

      await finalizeCampaignIfComplete(failedJob.campaign);

      console.log(`Job ${failedJob._id} permanently failed`);
    } else {
      // Retry
      await Job.findByIdAndUpdate(failedJob._id, {
        $set: {
          status: "pending",
          attempts: newAttempts,
          error: error.message,
        },
      });

      console.log(
        `Job ${failedJob._id} will retry. Attempt ${newAttempts}/${failedJob.maxAttempts}`
      );
    }
  }
};

const startWorker = async () => {
  await connectDatabase();

  console.log("Email worker started");

  while (true) {
    try {
      const job = await Job.findOne({
        status: "pending",
      }).sort({
        createdAt: 1,
      });

      if (job) {
        await processJob(job);
      } else {
        // No pending job.
        // Wait before checking MongoDB again.
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Worker error:", error.message);

      // Prevent the worker from crashing because of an unexpected error
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

if (require.main === module) {
  startWorker();
}

module.exports = {
  processJob,
  startWorker,
  finalizeCampaignIfComplete,
};

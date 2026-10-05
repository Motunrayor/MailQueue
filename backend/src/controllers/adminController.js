const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Job = require("../models/Job");

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.role && ["user", "admin"].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    if (req.query.search?.trim()) {
      const search = escapeRegex(req.query.search.trim());

      filter.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "firstname middlename lastname email role accountStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/campaigns
exports.getCampaigns = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    const validStatuses = [
      "draft",
      "queued",
      "processing",
      "completed",
      "failed",
    ];

    if (req.query.status) {
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.search?.trim()) {
      filter.name = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: "i",
      };
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .select(
          "name subject status user totalRecipients processedCount successCount failedCount createdAt updatedAt"
        )
        .populate("user", "firstname lastname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Campaign.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCampaigns,
      campaignStatuses,
      totalJobs,
      jobStatuses,
    ] = await Promise.all([
      User.countDocuments(),

      Campaign.countDocuments(),

      Campaign.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Job.countDocuments(),

      Job.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const campaignCounts = {
      draft: 0,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const item of campaignStatuses) {
      campaignCounts[item._id] = item.count;
    }

    const jobCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const item of jobStatuses) {
      jobCounts[item._id] = item.count;
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCampaigns,
        campaigns: campaignCounts,
        totalJobs,
        jobs: jobCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

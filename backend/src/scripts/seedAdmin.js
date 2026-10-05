
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");

async function seedAdmin() {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_FIRSTNAME,
    ADMIN_LASTNAME,
  } = process.env;

  if (
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    !ADMIN_FIRSTNAME ||
    !ADMIN_LASTNAME
  ) {
    throw new Error(
      "Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRSTNAME and ADMIN_LASTNAME."
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  await connectDatabase();

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  let admin = await User.findOne({ email });

  if (admin) {
    // Promote/update only the explicitly configured account.
    admin.role = "admin";
    admin.accountStatus = "active";
    admin.password = hashedPassword;
    await admin.save();
  } else {
    admin = await User.create({
      firstname: ADMIN_FIRSTNAME.trim(),
      lastname: ADMIN_LASTNAME.trim(),
      email,
      password: hashedPassword,
      account_type: "individual",
      role: "admin",
      accountStatus: "active",
      onboardingstatus: "completed",
    });
  }

  console.log(`Admin account provisioned: ${admin.email}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Admin provisioning failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
  
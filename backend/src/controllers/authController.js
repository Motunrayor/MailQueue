const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Mail = require("../mail/mail");
const { sendOtpEmail } = require("../services/emailService");

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, address, phone_no, state, country, account_type } = req.body;

    if (!firstname || !lastname || !email || !password || !account_type || !phone_no || !address || !state || !country) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (account_type === "organization") {
      const { company_name, brand, socialmedia_url } = req.body;
      if (!company_name || !socialmedia_url) {
        return res.status(400).json({
          success: false,
          message: "Company name, brand, and social media information are required for organization accounts",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword, onboardingstatus: "completed" });

    try {
      const welcomeMail = new Mail();
      await welcomeMail.sendWelcomeEmail({
        to: user.email,
        name: user.firstname ,
      });
    } catch (mailError) {
      console.error("Welcome email failed:", mailError.message);
    }

    res.status(201).json({
      success: true,
      token: signToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      success: true,
      token: signToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.requestChangePassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "This email was not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp_code = otp;
    user.expiredotp_time = otpExpiry;

    await user.save();

    await sendOtpEmail({
      email: user.email,
      otp,
      userName: user.firstname || "User",
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { email, otp_code, newPassword, confirmPassword } = req.body;

    if (!email || !otp_code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, new password and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.otp_code !== otp_code) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (!user.expiredotp_time || new Date() > user.expiredotp_time) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp_code = undefined;
    user.expiredotp_time = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};


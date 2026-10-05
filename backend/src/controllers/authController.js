const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Mail = require("../mail/mail");
const { sendOtpEmail } = require("../services/emailService");

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, role: user.role}, process.env.JWT_SECRET, { expiresIn: "1d" });

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

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

exports.getMe = async(req, res, next) => {
  try{
    const user = await User.findById(req.user.id).select("-password");
    if (!user){
      return res.status(404).json({success: false, message: "User not found"});
    }
    res.status(200).json({success: true, user});
  }catch (error){
    next(error);
  }
};

exports.requestChangePassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for that email, a reset code has been sent.",
      });
    }

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOtpHash = hashOtp(otp);
    user.passwordResetOtpExpiresAt = otpExpiry;
    user.passwordResetOtpAttempts = 0;
    await user.save();

    await sendOtpEmail({
      email: user.email,
      otp,
      userName: user.firstname || "User",
    });

    return res.status(200).json({
      success: true,
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { email, otp_code, newPassword, confirmPassword } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof otp_code !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, new password and confirmation are required",
      });
    }

    if (!/^\d{6}$/.test(otp_code)) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit reset code from your email",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts"
    );

    if (!user || !user.passwordResetOtpHash) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if ((user.passwordResetOtpAttempts || 0) >= 5) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Too many incorrect codes. Please request a new reset code.",
      });
    }

    if (
      !user.passwordResetOtpExpiresAt ||
      user.passwordResetOtpExpiresAt.getTime() <= Date.now()
    ) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new one.",
      });
    }

    const suppliedOtpHash = Buffer.from(hashOtp(otp_code), "hex");
    const storedOtpHash = Buffer.from(user.passwordResetOtpHash, "hex");
    if (
      storedOtpHash.length !== suppliedOtpHash.length ||
      !crypto.timingSafeEqual(storedOtpHash, suppliedOtpHash)
    ) {
      user.passwordResetOtpAttempts =
        (user.passwordResetOtpAttempts || 0) + 1;
      if (user.passwordResetOtpAttempts >= 5) {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = undefined;
        await user.save();
        return res.status(400).json({
          success: false,
          message: "Too many incorrect codes. Please request a new reset code.",
        });
      }
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

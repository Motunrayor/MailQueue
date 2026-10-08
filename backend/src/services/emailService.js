import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getOtpTemplate = (otp, userName = "User") => {
  const filePath = path.join(__dirname, "..", "mail", "otpmail.html");
  let html = fs.readFileSync(filePath, "utf8");

  html = html.replace(/{{OTP}}/g, otp);
  html = html.replace(/{{USER_NAME}}/g, userName);
  html = html.replace(/{{APP_NAME}}/g, "MailQueue");

  return html;
};

exports.sendOtpEmail = async ({ email, otp, userName }) => {
  try {
    const html = getOtpTemplate(otp, userName || "User");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Your MailQueue OTP Code",
      html,
    });

    return info;
  } catch (error) {
    throw error;
  }
};

exports.sendCampaignEmail = async ({
  email,
  subject,
  message,
  campaignName,
}) => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "mail",
      "campaignMail.html"
    );

    let html = fs.readFileSync(filePath, "utf8");

    // Replace campaign placeholders
    html = html.replace(/{{subject}}/g, subject || "");
    html = html.replace(
      /{{heading}}/g,
      campaignName || "MailQueue Campaign"
    );
    html = html.replace(/{{preheader}}/g, subject || "");

    // message contains the HTML-formatted campaign content
    html = html.replace(/{{content}}/g, message || "");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
      text: message.replace(/<[^>]*>/g, ""),
    });

    return info;
  } catch (error) {
    throw error;
  }
};

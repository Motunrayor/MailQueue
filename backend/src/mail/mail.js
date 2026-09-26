require("dotenv").config();

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

class Mail {
    constructor() {
        this.mailOptions = {
            from: {
                address: process.env.EMAIL_USER,
                name: "MailQueue",
            },
        };
    }

    setPlatformName(name) {
        this.mailOptions.from.name = name;
    }

    setTo(receiverMail) {
        this.mailOptions.to = receiverMail;
    }

    setAttachments(attachment) {
        const attachments = this.mailOptions.attachments || [];
        attachments.push(attachment);
        this.mailOptions.attachments = attachments;
    }

    setSubject(subject) {
        this.mailOptions.subject = subject;
    }

    setText(text) {
        this.mailOptions.text = text;
    }

    setHtml(html) {
        this.mailOptions.html = html;
    }

    async sendWelcomeEmail({ to, name }) {
        const templatePath = path.join(__dirname, "welcomemail.html");

        let html = fs.readFileSync(templatePath, "utf8");

        html = html.replace(
            /{{USER_NAME}}/g,
            name || "there"
        );

        html = html.replace(
            /{{APP_NAME}}/g,
            "MailQueue"
        );

        this.setTo(to);
        this.setSubject("Welcome to MailQueue");
        this.setHtml(html);

        return this.send();
    }

    async send() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("Email service is not configured");
        }

        return transporter.sendMail(this.mailOptions);
    }
}

module.exports = Mail;
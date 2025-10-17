"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: process.env.SMTP_SERVICE || 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendOtpEmail(to, otp) {
    const mail = {
        from: process.env.SMTP_USER,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };
    await transporter.sendMail(mail);
}

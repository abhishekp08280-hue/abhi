"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailOnApply = sendMailOnApply;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: process.env.SMTP_SERVICE || 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendMailOnApply(toEmail, teacherId, jobTitle) {
    const mail = {
        from: process.env.SMTP_USER,
        to: toEmail,
        subject: `New application for ${jobTitle}`,
        text: `A teacher (ID: ${teacherId}) has applied for your job: ${jobTitle}. Login to view details.`,
    };
    await transporter.sendMail(mail);
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMailOnApply(toEmail: string, teacherId: string, jobTitle: string) {
  const mail = {
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: `New application for ${jobTitle}`,
    text: `A teacher (ID: ${teacherId}) has applied for your job: ${jobTitle}. Login to view details.`,
  };
  await transporter.sendMail(mail);
}

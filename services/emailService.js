const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.SMTP_SERVICE || 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send OTP email
const sendOTP = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Teacher Portal - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Teacher Portal</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with Teacher Portal. To complete your registration, 
              please verify your email address using the OTP below:
            </p>
            
            <div style="background: #fff; border: 2px dashed #667eea; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP is valid for 10 minutes. If you didn't request this verification, 
              please ignore this email.
            </p>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>Security Tip:</strong> Never share your OTP with anyone. Our team will never ask for your OTP.
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: #999;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 Teacher Portal. All rights reserved.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send job application notification
const sendJobApplicationNotification = async (institutionEmail, teacherName, jobTitle, applicationId) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: institutionEmail,
      subject: `New Job Application - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Teacher Portal</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">New Job Application</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">New Application Received!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You have received a new job application for the position: <strong>${jobTitle}</strong>
            </p>
            
            <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
              <p><strong>Applicant:</strong> ${teacherName}</p>
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Applied At:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/institution/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Application
              </a>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: #999;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 Teacher Portal. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Job application notification sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending job application notification:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  sendJobApplicationNotification
};
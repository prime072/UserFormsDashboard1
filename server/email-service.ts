import nodemailer from "nodemailer";
import crypto from "crypto";

// Initialize transporter with Gmail App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "your-email@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "your-app-password",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.APP_URL || "http://localhost:5000"}/verify-email/${token}`;
  
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Verify Your FormFlow Email",
      html: `
        <h2>Welcome to FormFlow!</h2>
        <p>Please verify your email to complete your registration.</p>
        <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Your FormFlow Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your one-time password (OTP) for password reset is:</p>
        <h3 style="background-color: #f3f4f6; padding: 10px; letter-spacing: 2px;">${otp}</h3>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    console.log(`Password reset OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending reset OTP:", error);
    throw error;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_FROM_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export async function sendOTPEmail(toEmail: string, toName: string, otp: string): Promise<void> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#1A237E;padding:24px 32px">
        <h2 style="color:#fff;margin:0;font-size:18px">Delhi Police Conference Hall</h2>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:12px">Booking Management System</p>
      </div>
      <div style="padding:32px">
        <p style="color:#111827;font-size:15px">Hello <strong>${toName}</strong>,</p>
        <p style="color:#374151;font-size:14px">Your One-Time Password (OTP) for login is:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1A237E">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:11px;margin:0">If you did not request this OTP, please ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Delhi Police Conference Hub" <${process.env.SMTP_FROM_EMAIL}>`,
    to:   toEmail,
    subject: `Your OTP: ${otp} — Delhi Police Conference Hall`,
    text:  `Hello ${toName},\n\nYour OTP is: ${otp}\n\nValid for 10 minutes. Do not share.\n\nDelhi Police Conference Hall Booking System`,
    html,
  });
}

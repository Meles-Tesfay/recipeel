import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const from = process.env.EMAIL_FROM || '"ReciPeel" <noreply@recipeel.com>';
  const subject = "Reset Your ReciPeel Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d6a4f;">Reset Your Password</h2>
      <p>You requested a password reset for your ReciPeel account.</p>
      <p>Click the button below to set a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2d6a4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ReciPeel. All rights reserved.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};

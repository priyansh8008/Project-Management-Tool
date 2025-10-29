import nodemailer from "nodemailer";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // ✅ Use real SMTP (Brevo / Gmail / etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // use true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // ⚠️ Fallback only for local dev
    const testAcc = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAcc.user, pass: testAcc.pass },
    });
  }

  return transporter;
}

// ✅ Send verification email
export async function sendVerificationEmail(to, token) {
  const t = await getTransporter();
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your Project MGT account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;">
        <h2>Welcome to Project MGT 👋</h2>
        <p>Please verify your email to activate your account:</p>
        <a href="${verifyUrl}" style="background:#0070f3;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a>
        <p style="margin-top:20px;font-size:14px;color:#555;">If you didn’t create this account, you can safely ignore this email.</p>
      </div>
    `,
  });

  console.log("✅ Verification email sent:", info.messageId);
  return { messageId: info.messageId };
}

// ✅ Send password reset email
export async function sendPasswordResetEmail(to, token) {
  const t = await getTransporter();
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your Project MGT password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;">
        <h2>Password Reset Requested</h2>
        <p>Click below to reset your password. This link expires in 15 minutes:</p>
        <a href="${resetUrl}" style="background:#e63946;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
        <p style="margin-top:20px;font-size:14px;color:#555;">If you didn’t request a password reset, please ignore this email.</p>
      </div>
    `,
  });

  console.log("✅ Password reset email sent:", info.messageId);
  return { messageId: info.messageId };
}

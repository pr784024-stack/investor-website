import nodemailer from "nodemailer";

export const isEmailConfigured = () => {
  // Resend
  const hasResend = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "xxxx" && process.env.RESEND_API_KEY !== "");
  // Brevo
  const hasBrevo = !!(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== "xxxx" && process.env.BREVO_API_KEY !== "");
  // SMTP
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return hasResend || hasBrevo || hasSmtp;
};

export const isSmsConfigured = () => {
  // MSG91
  const hasMsg91 = !!(
    (process.env.MSG91_API_KEY && process.env.MSG91_API_KEY !== "xxxx" && process.env.MSG91_API_KEY !== "") ||
    (process.env.MSG91_AUTH_KEY && process.env.MSG91_AUTH_KEY !== "xxxx" && process.env.MSG91_AUTH_KEY !== "")
  );
  // Twilio
  const hasTwilio = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_ACCOUNT_SID !== "xxxx" &&
    process.env.TWILIO_ACCOUNT_SID !== "" &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
  return hasMsg91 || hasTwilio;
};

export const isProductionMode = () => {
  // We are in production mode if a database URL is present AND both email and SMS credentials are configured.
  const hasDb = !!(process.env.DATABASE_URL && process.env.DATABASE_URL !== "" && !process.env.DATABASE_URL.includes("xxxx"));
  return hasDb && isEmailConfigured() && isSmsConfigured();
};

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
  const from = process.env.SMTP_FROM || "InvestorBridge <noreply@investorbridge.com>";

  // 1. Try SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[SMTP] Sending email to ${to} using host ${process.env.SMTP_HOST}...`);
    try {
      const port = parseInt(process.env.SMTP_PORT || "587");
      const secure = process.env.SMTP_SECURE === "true" || port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""),
      });
      console.log(`[SMTP SUCCESS] Email sent to ${to}`);
      return;
    } catch (err) {
      console.error("[SMTP ERROR] Failed to send email via SMTP:", err);
      // Fallback to Resend or Brevo if available
    }
  }

  // 2. Try Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey !== "xxxx" && resendKey !== "") {
    console.log(`[RESEND] Sending email to ${to}...`);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      console.log(`[RESEND SUCCESS] Email sent to ${to}`);
      return;
    } catch (err) {
      console.error("[RESEND ERROR] Failed to send email via Resend:", err);
      // Fallback to Brevo if available
    }
  }

  // 3. Try Brevo if configured
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey && brevoKey !== "xxxx" && brevoKey !== "") {
    console.log(`[BREVO] Sending email to ${to}...`);
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "InvestorBridge", email: from.includes("<") ? from.split("<")[1].replace(">", "") : from },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      console.log(`[BREVO SUCCESS] Email sent to ${to}`);
      return;
    } catch (err) {
      console.error("[BREVO ERROR] Failed to send email via Brevo:", err);
    }
  }

  // 4. Simulation Fallback
  console.log(`\n===========================================\n[EMAIL SIMULATION (DEMO MODE)]\nTo: ${to}\nSubject: ${subject}\nBody: ${html.replace(/<[^>]*>?/gm, "")}\n===========================================\n`);
}

export async function sendSms({ phone, message }: { phone: string; message: string }) {
  // 1. Try MSG91 if configured
  const msg91AuthKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_API_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID || "xxxx";
  if (msg91AuthKey && msg91AuthKey !== "xxxx" && msg91AuthKey !== "") {
    console.log(`[MSG91] Sending SMS to ${phone}...`);
    try {
      const cleanPhone = phone.replace(/\+/g, "");
      const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&authkey=${msg91AuthKey}&otp=${message.match(/\d+/)?.[0] || message}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      console.log(`[MSG91 SUCCESS] SMS sent to ${phone}`);
      return;
    } catch (err) {
      console.error("[MSG91 ERROR] Failed to send SMS via MSG91:", err);
      // Fallback to Twilio if available
    }
  }

  // 2. Try Twilio if configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  if (accountSid && accountSid !== "xxxx" && accountSid !== "" && authToken && fromPhone) {
    console.log(`[TWILIO] Sending SMS to ${phone}...`);
    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: phone,
          Body: message,
        }).toString(),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      console.log(`[TWILIO SUCCESS] SMS sent to ${phone}`);
      return;
    } catch (err) {
      console.error("[TWILIO ERROR] Failed to send SMS via Twilio:", err);
    }
  }

  // 3. Simulation Fallback
  console.log(`\n===========================================\n[SMS SIMULATION (DEMO MODE)]\nTo: ${phone}\nMessage: ${message}\n===========================================\n`);
}

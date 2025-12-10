const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"HTAAQ Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email error:", err);
  }
};

module.exports = { sendEmail };

// const { Resend } = require('resend');
// require("dotenv").config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async (to, subject, html) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'HTAAQ Admin <onboarding@resend.dev>',
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       console.error("Resend error:", error);
//       return { success: false, error };
//     }

//     console.log("Email sent successfully:", data.id);
//     return { success: true, data };
//   } catch (err) {
//     console.error("Email sending failed:", err);
//     return { success: false, error: err.message };
//   }
// };

// module.exports = { sendEmail };
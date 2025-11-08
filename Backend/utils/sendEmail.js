const nodemailer = require("nodemailer");

function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };
  try {
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { sendEmail };

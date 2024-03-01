import nodemailer from "nodemailer";
import { config } from "dotenv";
config({ path: "../../config/dev.env" });
export const sendEmail = async ({
  to = "",
  subject = "",
  message = "",
  attachments = [],
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL, // sender address
    to,
    subject, // Subject line
    text: "Hi", // plain text body
    html: message, // html body
    attachments,
  });

  if (info.accepted.length) {
    return true;
  } else {
    return false;
  }
};

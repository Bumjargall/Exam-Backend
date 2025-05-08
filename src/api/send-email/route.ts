
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { toEmail, resetLink } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Examly" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Нууц үг шинэчлэх холбоос",
    html: `<p>Шинэ нууц үг тохируулах бол дараах холбоос дээр дарна уу:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

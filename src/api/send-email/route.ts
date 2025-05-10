require("dotenv").config();
const nodemailer = require("nodemailer");

interface EmailRequest {
  toEmail: string;
  resetLink: string;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { toEmail, resetLink }: EmailRequest = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
      },
    });

    const mailOptions: MailOptions = {
      from: `"Examly" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Нууц үг шинэчлэх холбоос",
      html: `<p>Шинэ нууц үг тохируулах бол дараах холбоос дээр дарна уу:</p>
           <a href="${resetLink}">${resetLink}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
    });
  }
}

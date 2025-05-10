import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserService } from "../service/userService";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { MailOptions } from "nodemailer/lib/json-transport";
dotenv.config();

// Get all users
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
};

// Get user by ID
export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

// Login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Имэйл болон нууц үг шаардлагатай",
      });
      return;
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "И-мэйл бүртгэлгүй байна",
      });
      return;
    }

    const isPasswordValid = await UserService.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Нэвтрэх мэдээлэл буруу байна",
      });
      return;
    }

    const token = UserService.generateToken(user);
    const { password: _removed, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Амжилттай нэвтэрлээ",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Алдаа: ", error);
    return next(error);
  }
};

// Register
export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "Хэрэглэгч амжилттай бүртгэгдлээ",
      data: newUser,
    });
  } catch (error) {
    console.error("Алдаа: ", error);
    return next(error);
  }
};

// Update user
export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    return next(error);
  }
};

// Delete user
export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }
    res.status(200).json({
      success: true,
      message: "Амжилттай устгагдлаа",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// Change user role
export const changeUserRole: RequestHandler = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updatedUser = await UserService.changeUserRole(req.params.id, role);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    return next(error);
  }
};

// Update password by ID
export const updatePassword: RequestHandler = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    await UserService.updatePassword(req.params.id, newPassword);
    res.status(200).json({
      success: true,
      message: "Нууц үг амжилттай шинэчлэгдлээ",
    });
  } catch (error) {
    return next(error);
  }
};

// Forgot password: generate reset token and send email
export const forgotPassword: RequestHandler = async (req, res, next) => {
  const { email } = req.body;
  try {
    const token = await UserService.generateResetToken(email);
    const backendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${backendUrl}/reset-password?token=${token}`;

    const emailApiUrl =
      process.env.EMAIL_API_URL || "http://localhost:8000/api/send-email";

    const emailResponse = await fetch(emailApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail: email, resetLink }),
    });

    if (!emailResponse.ok) {
      throw new Error("Имэйл илгээхэд алдаа гарлаа.");
    }

    res.status(200).json({
      success: true,
      message: "Сэргээх холбоос имэйл рүү илгээгдлээ",
    });
  } catch (error) {
    return next(error);
  }
};

// Reset password with token
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.params; // <-- if token comes from query ?token=
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Нууц үг хамгийн багадаа 4 тэмдэгт байх ёстой.",
      });
    }

    await UserService.resetPassword(token as string, password);

    res.status(200).json({
      success: true,
      message: "Нууц үг амжилттай шинэчлэгдлээ",
    });
  } catch (error) {
    return next(error);
  }
};

// Send email directly (used by forgotPassword)
export const sendResetEmail: RequestHandler = async (req, res, next) => {
  const { toEmail, resetLink } = req.body;

  if (!toEmail || !resetLink) {
    return res
      .status(400)
      .json({ success: false, message: "Мэдээлэл дутуу байна..." });
  }

  try {
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

    return res.status(200).json({
      success: true,
      message: "Имэйл амжилттай илгээгдлээ",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Имэйл илгээхэд алдаа гарлаа",
      error,
    });
  }
};

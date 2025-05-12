import { ObjectId } from "mongodb";
import User, { IUser, UserRole } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dbConnect from "../db";
import mongoose from "mongoose";
import { PassThrough } from "stream";

dotenv.config();

export class UserService {
  static async getAllUsers(): Promise<IUser[]> {
    await dbConnect();
    try {
      return await User.find().select("-password").lean<IUser[]>();
    } catch (error) {
      throw new Error(
        `"Хэрэглэгчдийн мэдээлэл авахад алдаа гарлаа:" ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
  // Хэрэглэгч бүртгэх
  static async createUser(userData: Omit<IUser, "_id">): Promise<IUser> {
    await dbConnect();
    const [emailExists, phoneExists] = await Promise.all([
      User.findOne({ email: userData.email }),
      userData.phone ? User.findOne({ phone: userData.phone }) : null,
    ]);

    if (emailExists) throw new Error("Энэ имэйл бүртгэлтэй байна");
    if (phoneExists) throw new Error("Энэ утас бүртгэлтэй байна");

    const user = await User.create(userData);
    return user.toObject();
  }

  // Имэйлээр хэрэглэгч авах
  static async findByEmail(email: string): Promise<IUser | null> {
    await dbConnect();
    const user = await User.findOne({ email })
      .select("+password")
      .lean<IUser>();
    return user;
  }

  // Нууц үг шалгах
  static async comparePassword(
    inputPassword: string,
    storedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
  // JWT токен үүсгэх
  static generateToken(user: IUser): string {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error("JWT_SECRET тохируулаагүй байна");

    const payload = {
      id: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, secretKey, { expiresIn: "24h" });
  }

  // Хэрэглэгчийн ID-р мэдээлэл авах
  static async getUserById(userId: string): Promise<IUser | null> {
    await dbConnect();
    if (!ObjectId.isValid(userId)) throw new Error("Хүчинтэй ID биш");
    return await User.findById(userId).select("-password").lean<IUser | null>();
  }

  // Хэрэглэгчийн мэдээлэл шинэчлэх
  static async updateUser(
    userId: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    await dbConnect();
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("Энэ утасны дугаар өөр хэрэглэгч дээр бүртгэлтэй байна.");
    }
    if (!ObjectId.isValid(userId)) throw new Error("Хүчинтэй ID биш");
    delete userData.password; // password өөрчлөхгүй
    return await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean<IUser | null>();
  }

  // Хэрэглэгч устгах
  static async deleteUser(userId: string): Promise<IUser | null> {
    await dbConnect();
    if (!ObjectId.isValid(userId)) throw new Error("Хүчинтэй ID биш");

    const user = await User.findByIdAndDelete(userId).lean<IUser | null>();
    if (!user) throw new Error("Хэрэглэгч олдсонгүй");
    return user;
  }

  // Role-р хэрэглэгч авах
  static async getUsersByRole(role: UserRole): Promise<IUser[]> {
    await dbConnect();
    return await User.find({ role }).select("-password -__v").lean<IUser[]>();
  }

  // Хэрэглэгчийн role өөрчлөх
  static async changeUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<Omit<IUser, "password"> | null> {
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("ID буруу");

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean<Omit<IUser, "password">>();

    if (!updatedUser) throw new Error("Хэрэглэгч олдсонгүй");
    return updatedUser;
  }

  // 🔐 Нууц үг шинэчлэх (өөрийн account дотроос)
  static async updatePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    await dbConnect();
    if (!ObjectId.isValid(userId)) throw new Error("ID буруу");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
  }

  // 📩 Нууц үг сэргээх токен үүсгэх
  static async generateResetToken(email: string): Promise<string> {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) throw new Error("И-мэйл бүртгэлгүй байна");

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
  }

  // 🛠 Reset password using token
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    await dbConnect();

    const user = await User.findById(payload.id);
    if (!user) {
      throw new Error("Хэрэглэгч олдсонгүй.");
    }

    user.password = newPassword;
    await user.save();
  }

  //role -ыг нь уншаад тоог нь буцаах
  static async getRoleByUsers(role: string): Promise<number> {
    await dbConnect();

    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error("Буруу role илгээгдлээ");
    }

    const count = await User.countDocuments({ role });
    return count;
  }
}

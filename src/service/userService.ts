import { ObjectId } from "mongodb";
import User, { IUser, UserRole } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import dbConnect from "../db";
import mongoose, { FlattenMaps } from "mongoose";

dotenv.config();

export class UserService {
  static async createUser(userData: Omit<IUser, "_id">): Promise<IUser> {
    await dbConnect();
    try {
      // Check for existing email or phone
      const [emailExists, phoneExists] = await Promise.all([
        User.findOne({ email: userData.email }),
        userData.phone ? User.findOne({ phone: userData.phone }) : null,
      ]);

      if (emailExists) {
        throw new Error("Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна");
      }
      if (phoneExists) {
        throw new Error("Энэ утасны дугаар аль хэдийн бүртгэгдсэн байна");
      }

      const user = await User.create(userData);
      return user.toObject();
    } catch (error) {
      throw new Error(
        `Хэрэглэгч бүртгэхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async getAllUsers(): Promise<IUser[]> {
    await dbConnect();
    try {
      return await User.find().select("-password").lean<IUser[]>();
    } catch (error) {
      throw new Error(
        `Хэрэглэгчдийн мэдээлэл авахад алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    await dbConnect();
    try {
      return await User.findOne({ email })
        .select("+password")
        .lean<IUser | null>();
    } catch (error) {
      throw new Error(
        `Имэйлээр хайхад алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async comparePassword(
    inputPassword: string,
    storedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      throw new Error(
        `Нууц үг шалгахад алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static generateToken(user: IUser): string {
    try {
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error("JWT нууц түлхүүр тохируулаагүй байна");
      }

      const payload = {
        id: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      };

      return jwt.sign(payload, secretKey, { expiresIn: "24h" });
    } catch (error) {
      throw new Error(
        `Токен үүсгэхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    await dbConnect();
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("Хүчинтэй userID оруулна уу");
      }
      return await User.findById(userId)
        .select("-password")
        .lean<IUser | null>();
    } catch (error) {
      throw new Error(
        `Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async updateUser(
    userId: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    await dbConnect();
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("Хүчинтэй userID оруулна уу");
      }

      // Don't allow password updates through this method
      if (userData.password) {
        delete userData.password;
      }

      return (await User.findByIdAndUpdate(userId, userData, {
        new: true,
        runValidators: true,
      })
        .select("-password")
        .lean()) as IUser | null;
    } catch (error) {
      throw new Error(
        `Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async deleteUser(userId: string): Promise<IUser | null> {
    await dbConnect();
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("Хүчинтэй userID оруулна уу");
      }

      const user = await User.findById(userId).lean<IUser | null>();
      await User.findByIdAndDelete(userId).lean();
      if (!user) {
        throw new Error("Хэрэглэгч олдсонгүй");
      }

      return user as IUser;
    } catch (error) {
      throw new Error(
        `Хэрэглэгч устгахад алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  static async getUsersByRole(role: UserRole): Promise<IUser[]> {
    await dbConnect();
    try {
      const users = await User.find({ role })
        .select("-password -__v")
        .lean<IUser[]>();

      return users;
    } catch (error) {
      throw new Error(
        `${role} эрхтэй хэрэглэгчдийг авахад алдаа гарлаа: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  static async changeUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<Omit<IUser, "password"> | null> {
    await dbConnect();

    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Хүчинтэй userID оруулна уу");
      }

      // Update and return the user with new role
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators on update
        }
      )
        .select("-password") // Exclude password field
        .lean<Omit<IUser, "password">>(); // Proper typing for lean result

      if (!updatedUser) {
        throw new Error("Хэрэглэгч олдсонгүй");
      }

      return updatedUser;
    } catch (error) {
      throw new Error(
        `Хэрэглэгчийн эрх шинэчлэхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  static async updatePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    await dbConnect();
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("Хүчинтэй userID оруулна уу");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      throw new Error(
        `Нууц үг шинэчлэхэд алдаа гарлаа: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}

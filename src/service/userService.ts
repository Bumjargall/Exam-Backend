import { ObjectId, Collection } from "mongodb";
import { client } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const db = client.db("Examcom");
export class UserService {
  private static usersCollection: Collection = db.collection("users");

  static async createUser(userData: any) {
    return await this.usersCollection.insertOne(userData);
  }

  static async getAllUsers() {
    return await this.usersCollection.find().toArray();
  }

  //login
  static async findByEmail(email: string) {
    return await this.usersCollection.findOne({ email: email });
  }
  static async comparePassword(
    inputPassword: string,
    storedPassword: string
  ): Promise<boolean> {
    const status = await bcrypt.compare(inputPassword, storedPassword);
    console.log(status);
    return status;
  }
  static generateToken(user: any): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role, // Хэрэв хэрэглэгчийн эрхийн түвшин байгаа бол
    };

    const secretKey = process.env.JWT_SECRET || "myVeryStrongSecret1234567890"; // Орчны хувьсагч ашиглах
    const options: jwt.SignOptions = { expiresIn: "24h" }; // Токены хүчинтэй хугацаа

    return jwt.sign(payload, secretKey, options);
  }

  static async getUserById(userId: string) {
    return await this.usersCollection.findOne({ _id: new ObjectId(userId) });
  }

  static async updateUser(userId: string, userData: any) {
    return await this.usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: userData }
    );
  }

  static async deleteUser(userId: string) {
    return await this.usersCollection.deleteOne({ _id: new ObjectId(userId) });
  }

  //get role users
  static async getUsersByRole(role: string) {
    return await this.usersCollection.find({ role: role }).toArray();
  }
}

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "teacher" | "student";

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  organization: string;
  phone: number;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "Нэр шаардлагатай"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Овог шаардлагатай"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Имэйл шаардлагатай"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Хүчинтэй имэйл оруулна уу",
      ],
    },
    organization: {
      type: String,
      required: [true, "Шаардлагатай"],
    },
    password: {
      type: String,
      required: [true, "Нууц үг шаардлагатай"],
      minlength: [4, "Нууц үг 4-с дээш тэмдэгтээс бүрдэх ёстой"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
    phone: {
      type: Number,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Password hashing middleware
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.models?.User ||
  mongoose.model<IUser>("User", UserSchema);

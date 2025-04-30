import mongoose, { Schema, Document, Model } from "mongoose";

export type ExamStatus = "active" | "inactive";

interface IExam extends Document {
  title: string;
  description: string;
  dateTime: Date;
  duration: string;
  totalScore: number;
  status: ExamStatus;
  key: string;
  questions: Array<object>;
  createUserById: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema<IExam> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    key: {
      type: String,
      required: true,
    },
    questions: {
      type: [Object],
      required: true,
    },
    createUserById: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Exam: Model<IExam> = mongoose.models?.Exam || mongoose.model<IExam>("exams", ExamSchema);

export default Exam;
import mongoose, { Schema, Document, Model } from "mongoose";
import { Types } from "mongoose";
export type ExamStatus = "active" | "inactive";

export type AnswerOption = {
  text: string;
  isCorrect?: boolean;
};

export interface QuestionInput {
  id: string;
  question: string;
  answers?: AnswerOption[];
  score: number;
  type:
    | "multiple-choice"
    | "simple-choice"
    | "fill-choice"
    | "free-text"
    | "information-block"
    | "code";
}

export interface CreateExamInput {
  title: string;
  description: string;
  questions: QuestionInput[];
  dateTime: Date;
  duration: string | number;
  totalScore: number;
  status: "active" | "inactive";
  key: string;
  createUserById: string | Types.ObjectId;
}

export interface Question {
  id: string;
  question: string;
  answers?: AnswerOption[];
  score: number;
  type:
    | "multiple-choice"
    | "simple-choice"
    | "fill-choice"
    | "free-text"
    | "information-block"
    | "code";
}

export interface IExam extends Document {
  title: string;
  description: string;
  dateTime: Date;
  duration: Number;
  totalScore: number;
  status: ExamStatus;
  key: string;
  questions: Question[];
  createUserById: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    required: true,
    enum: [
      "multiple-choice",
      "simple-choice",
      "fill-choice",
      "free-text",
      "information-block",
      "code",
    ],
  },
  answers: [
    {
      text: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: false,
      },
    },
  ],
});

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
      type: Number,
      required: true,
      min: 1,
    },
    totalScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
    },
    createUserById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "exams",
  }
);

const Exam =
  (mongoose.models?.Exam as Model<IExam>) ||
  mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;

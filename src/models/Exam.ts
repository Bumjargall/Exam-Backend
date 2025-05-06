import mongoose, { Schema, Document, Model } from "mongoose";

export type ExamStatus = "active" | "inactive";

export type CreateExamInput = {
  title: string;
  description: string;
  dateTime: Date;
  duration: string;
  totalScore: number;
  status: "active" | "inactive";
  key: string;
  createUserById: string;
  questions: {
    text: string;
    points: number;
    questionType: string;
    options?: string[];
    correctAnswer?: string | string[];
  }[];
};

export interface IQuestion {
  text: string;
  points: number;
  questionType: string;
  options?: string[];
  correctAnswer?: string | string[];
}

export interface IExam extends Document {
  title: string;
  description: string;
  dateTime: Date;
  duration: Number;
  totalScore: number;
  status: ExamStatus;
  key: string;
  questions: IQuestion[];
  createUserById: mongoose.Types.ObjectId;
}

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
  questionType: {
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
  options: {
    type: [String],
    required: function (this: any) {
      return this.get("questionType") === "multiple-choice";
    },
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: function (this: any) {
      return this.get("questionType") !== "essay";
    },
  },
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

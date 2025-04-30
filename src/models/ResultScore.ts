import mongoose, { Schema, Document, Model } from "mongoose";

export type ResultStatus = "submitted" | "taking";

interface IResultScore extends Document {
  submittedAt: Date;
  score: number;
  status: ResultStatus;
  questions: Array<object>;
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResultScoreSchema: Schema<IResultScore> = new Schema(
  {
    submittedAt: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "taking"],
      required: true,
    },
    questions: {
      type: [Object],
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "exams",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "users", 
      required: true,
    },
  },
  {
    // createdAt болон updatedAt автоматаар үүсгэнэ
    timestamps: true, 
  }
);

const ResultScore: Model<IResultScore> =
  mongoose.models?.ResultScore || mongoose.model<IResultScore>("studentsExamScore", ResultScoreSchema);

export default ResultScore;
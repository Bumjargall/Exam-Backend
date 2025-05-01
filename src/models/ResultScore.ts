import mongoose, { Schema, Document, Model } from "mongoose";

export type ResultStatus = "submitted" | "taking";


interface IQuestionResult {
  questionId: mongoose.Types.ObjectId;
  answer: any;
  points?: number;
  isCorrect?: boolean;
}

export interface IResultScore extends Document {
  submittedAt: Date;
  score: number;
  status: ResultStatus;
  questions: IQuestionResult[];
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;
}

const QuestionResultSchema = new Schema<IQuestionResult>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'questions',
    required: true
  },
  answer: {
    type: Schema.Types.Mixed,
    required: true
  },
  points: {
    type: Number,
    min: 0
  },
  isCorrect: {
    type: Boolean
  }
});

const ResultScoreSchema: Schema<IResultScore> = new Schema(
  {
    submittedAt: {
      type: Date,
      required: function() {
        return this.status === 'submitted';
      }
    },
    score: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ["submitted", "taking"],
      required: true,
    },
    questions: {
      type: [QuestionResultSchema],
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    duration: {
      type: Number,
      min: 0,
      description: 'Шалгалтын үргэлжлэх хугацаа минутээр',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  {
    // createdAt болон updatedAt автоматаар үүсгэнэ
    timestamps: true, 
    collection: "studentsExamScore"
  }
);

const ResultScore: Model<IResultScore> =
  mongoose.models?.ResultScore || mongoose.model<IResultScore>("ResultScore", ResultScoreSchema);

export default ResultScore;
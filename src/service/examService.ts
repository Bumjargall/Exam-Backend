import { ObjectId } from "mongodb";
import Exam, { CreateExamInput, IExam } from "../models/Exam";
import ResultScore, { IResultScore } from "../models/ResultScore";
import User from "../models/User";

interface ExamWithStudentInfo extends IResultScore {
  studentInfo: {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
  examInfo: {
    _id: ObjectId;
    title: string;
  }[];
}
interface StudentWithExamInfo extends IExam {
  _id: ObjectId;
  score: number;
  examInfo: {
    _id: ObjectId;
    title: string;
    createdAt: Date;
    totalScore: number;
    key: string;
  }[];
}

export class ExamService {
  static async createExam(examData: CreateExamInput): Promise<IExam> {
    try {
      const newExam = await Exam.create(examData);
      return newExam.toObject();
    } catch (error) {
      throw new Error("Шалгалт үүсгэх үед алдаа гарлаа: " + error);
    }
  }

  static async getAllExams(): Promise<IExam[]> {
    try {
      return await Exam.find().lean();
    } catch (error) {
      throw new Error("Шалгалт авах үед алдаа гарлаа: " + error);
    }
  }

  static async getExamById(examId: string): Promise<IExam | null> {
    if (!ObjectId.isValid(examId)) {
      throw new Error("examID шалгахад алдаа гарлаа...");
    }
    //    return await this.examsCollection.findOne({ _id: new ObjectId(examId) });
    try {
      return await Exam.findById(examId).lean();
    } catch (error) {
      throw new Error("Шалгалт авах үед алдаа гарлаа: " + error);
    }
  }
  static async updateExam(
    examId: string,
    examData: Partial<IExam>
  ): Promise<IExam | null> {
    if (!ObjectId.isValid(examId)) {
      throw new Error("ID буруу байна...");
    }
    try {
      const result = await Exam.findByIdAndUpdate(examId, examData, {
        new: true,
        runValidators: true,
      }).lean();
      return result;
    } catch (error) {
      throw new Error("Шалгалт шинэчлэх үед алдаа гарлаа: " + error);
    }
  }
  //шалгалт устгах үед тухайн шалгалтын resultExam устгах
  static async deleteExam(examId: string): Promise<{
    deleteCount: number;
    deleteExam: IExam;
  }> {
    if (!ObjectId.isValid(examId)) {
      throw new Error("Шалгалтын ID буруу байна...");
    }
    try {
      const deleteExam = await Exam.findByIdAndDelete(examId).lean();
      if (!deleteExam) {
        throw new Error("Шалгалт олдсонгүй...");
      }
      await ResultScore.deleteMany({ examId: deleteExam._id });
      return { deleteCount: 1, deleteExam };
    } catch (error) {
      throw new Error("Шалгалт устгах үед алдаа гарлаа: " + error);
    }
  }

  static async getExamByStudent(
    studentId: string
  ): Promise<StudentWithExamInfo[]> {
    if (!ObjectId.isValid(studentId)) {
      throw new Error("student_id шалгахад алдаа гарлаа...");
    }

    try {
      const exams = await ResultScore.aggregate<StudentWithExamInfo>([
        {
          $match: { studentId: new ObjectId(studentId) },
        },
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "examInfo",
          },
        },
        {
          $unwind: "$examInfo",
        },
        {
          $project: {
            _id: 1,
            score: 1,
            "examInfo._id": 1,
            "examInfo.title": 1,
            "examInfo.createdAt": 1,
            "examInfo.totalScore": 1,
            "examInfo.key": 1,
          },
        },
      ]);

      return exams;
    } catch (error) {
      throw new Error("Шалгалт авах үед алдаа гарлаа: " + error);
    }
  }
  static async getExamsWithStudentInfo(): Promise<ExamWithStudentInfo[]> {
    try {
      const exams = await ResultScore.aggregate<ExamWithStudentInfo>([
        {
          $lookup: {
            from: "users",
            localField: "studentId",
            foreignField: "_id",
            as: "studentInfo",
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "examInfo",
          },
        },
        {
          $unwind: "$examInfo",
        },
        {
          $project: {
            _id: 1,
            exam_id: 1,
            student_id: 1,
            startedAt: 1,
            submittedAt: 1,
            score: 1,
            status: 1,
            questions: 1,
            duration: 1,
            "studentInfo._id": 1,
            "studentInfo.firstName": 1,
            "studentInfo.lastName": 1,
            "studentInfo.email": 1,
            "examInfo.title": 1,
            "examInfo._id": 1,
          },
        },
      ]);
      return exams;
    } catch (error) {
      throw new Error("Шалгалт авах үед алдаа гарлаа" + error);
    }
  }

  //key value шалгаж илгээх
  static async getExamByKeyValue(key: string): Promise<IExam | null> {
    if (!key) {
      throw new Error("ID буруу байна...");
    }
    try {
      const exam = await Exam.findOne({ key }).lean();
      if (!exam) {
        throw new Error("Шалгалт олдсонгүй...");
      }
      return exam;
    } catch (error) {
      throw new Error("Шалгалт авах үед алдаа гарлаа: " + error);
    }
  }
}

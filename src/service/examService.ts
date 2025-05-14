import { ObjectId } from "mongodb";
import Exam, { CreateExamInput, IExam } from "../models/Exam";
import ResultScore, { IResultScore } from "../models/ResultScore";
import User from "../models/User";
import { use } from "react";
import dbConnect from "../db";

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

  static async getExamByCreateUser(userId: string): Promise<IExam[]> {
    const createUserById = new ObjectId(userId);
    if (!ObjectId.isValid(createUserById)) {
      throw new Error("examID шалгахад алдаа гарлаа...");
    }
    //    return await this.examsCollection.findOne({ _id: new ObjectId(examId) });
    try {
      const exams = await Exam.find({ createUserById }).lean();
      return exams;
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
  static async updateExamByStatus(
    examId: string,
    status: string
  ): Promise<IExam | null> {
    if (!ObjectId.isValid(examId)) {
      throw new Error("ID буруу байна...");
    }
    if (!["active", "inactive"].includes(status)) {
      throw new Error("Төлөв зөвхөн 'active' эсвэл 'inactive' байх ёстой.");
    }
    try {
      const result = await Exam.findByIdAndUpdate(
        examId,
        { status },
        { new: true, runValidators: true }
      ).lean();
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
  ): Promise<ExamWithStudentInfo[]> {
    if (!ObjectId.isValid(studentId)) {
      throw new Error("student_id шалгахад алдаа гарлаа...");
    }

    try {
      const exams = await ResultScore.aggregate<ExamWithStudentInfo>([
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

  //Admin хэсэгт буцаах тоон мэдээлэл
  static async getExamCount(): Promise<number> {
    return await Exam.countDocuments();
  }

  static async getRecentExams(limit = 5): Promise<any[]> {
    const exams = await Exam.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "createUserById",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          dateTime: 1,
          duration: 1,
          status: 1,
          totalScore: 1,
          createdAt: 1,
          createUserById: 1,
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
        },
      },
    ]);

    return exams;
  }
  //chart data
  static async getExamChartData(): Promise<{ week: string; count: number }[]> {
    await dbConnect();
    try {
  
      const data = await Exam.aggregate([
        {
          $match: {
            createdAt: { $type: "date" },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$createdAt",
                unit: "week",
                binSize: 1,
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            week: {
              $dateToString: { format: "%Y-%m-%d", date: "$_id" },
            },
            count: 1,
          },
        },
      ]);
  
      return data;
    } catch (err) {
      console.error("❌ Chart aggregate алдаа:", err);
      throw err;
    }
  }

  
}

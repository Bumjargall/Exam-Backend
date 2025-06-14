import { ObjectId } from "mongodb";
import ResultScore, { IResultScore } from "../models/ResultScore";
import Exam from "../models/Exam";
import User from "../models/User";
import mongoose from "mongoose";
import { validateObjectIds } from "../validator/objectId";
import redis from "../utils/redis";

interface StudentInfo {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface ICreateResult {
  status: string;
  examId: string;
  userId: string;
  score: number;
}

interface ExamWithStudentInfo
  extends Omit<IResultScore, "studentId" | "examId"> {
  studentInfo: StudentInfo;
  examId: ObjectId;
  examInfo?: {
    _id: ObjectId;
    title: string;
    key?: string;
    totalScore?: number;
  };
}

interface UpdateResultResponse {
  result: IResultScore | null;
  matchedCount: number;
}

interface DeleteResultResponse {
  deletedCount: number;
}

export class ResultService {
  static async createResult(resultData: ICreateResult): Promise<IResultScore> {
    const studentId = resultData?.userId;
    try {
      await validateObjectIds(
        resultData.examId.toString(),
        studentId.toString()
      );
      const dataToSave = {
        ...resultData,
        studentId: new mongoose.Types.ObjectId(studentId),
        score: 0,
        questions: [],
      };
      const result = await ResultScore.create(dataToSave);
      if (result?.examId) {
        await redis.del(`getResultByUsers:${result.examId}`);
      }

      return result.toObject();
    } catch (error) {
      throw new Error("CreateResult алдаа: " + error);
    }
  }

  static async getAllResults(): Promise<IResultScore[]> {
    try {
      return await ResultScore.find().lean();
    } catch (error) {
      throw new Error("ResultService.getAllResults алдаа: " + error);
    }
  }
  //createByUserId === userId харах

  static async getResultByCreator(userId: string): Promise<IResultScore[]> {
    try {
      await validateObjectIds(userId);
      const result = await ResultScore.aggregate([
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "examInfo",
          },
        },
        { $unwind: "$examInfo" },
        {
          $match: {
            "examInfo.createUserById": new ObjectId(userId),
          },
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            examId: 1,
            score: 1,
            status: 1,
            questions: 1,
            submittedAt: 1,
            duration: 1,
            examTitle: "$examInfo.title",
          },
        },
      ]);
      return result;
    } catch (err) {
      throw new Error("getResultByCreator алдаа: " + err);
    }
  }
  static async getResultByUserAndExam(
    examId: string,
    userId: string
  ): Promise<IResultScore | null> {
    await validateObjectIds(examId, userId);

    try {
      const result = await ResultScore.findOne({
        examId: new ObjectId(examId),
        studentId: new ObjectId(userId),
      }).lean();
      return result;
    } catch (err) {
      throw new Error("Алдаа гарлаа: " + err);
    }
  }

  static async getResultByExamId(examId: string): Promise<IResultScore[]> {
    if (!ObjectId.isValid(examId)) {
      throw new Error("examID шалгахад алдаа гарлаа...");
    }
    try {
      return await ResultScore.find({ examId: new ObjectId(examId) }).lean();
    } catch (error) {
      throw new Error("ResultService.getResultByExamId алдаа: " + error);
    }
  }
  static async updateResult(
    resultId: string,
    resultData: Partial<IResultScore>
  ): Promise<UpdateResultResponse> {
    try {
      await validateObjectIds(resultId);
      const updateResult = await ResultScore.updateOne(
        { _id: new ObjectId(resultId) },
        { $set: resultData }
      );
      const updatedDoc = await ResultScore.findById(resultId).lean();
      if (updatedDoc?.studentId) {
        await redis.del(`getResultByUsersId:${updatedDoc.studentId}`);
      }
      if (updatedDoc?.examId) {
        await redis.del(`getResultByUsers:${updatedDoc.examId}`);
      }
      return {
        result: updatedDoc,
        matchedCount: updateResult.matchedCount,
      };
    } catch (error) {
      throw new Error("ResultService.updateResult алдаа: " + error);
    }
  }
  static async deleteResult(resultId: string): Promise<DeleteResultResponse> {
    try {
      await validateObjectIds(resultId);
      const deleteResult = await ResultScore.deleteOne({
        _id: new ObjectId(resultId),
      });
      return {
        deletedCount: deleteResult.deletedCount,
      };
    } catch (error) {
      throw new Error("ResultService.deleteResult алдаа: " + error);
    }
  }
  //result -ын ExamId хэрэглэгчийн мэдээллийг гаргах
  static async getExamsWithSubmissions() {
    try {
      const examIds = await ResultScore.distinct("examId");
      const exams = await Exam.find({ _id: { $in: examIds } }).lean();
      return exams;
    } catch (error) {
      throw new Error("ResultService.getExamsWithSubmissions алдаа: " + error);
    }
  }
  static async getResultByUsers(
    examId: string
  ): Promise<ExamWithStudentInfo[]> {
    try {
      await validateObjectIds(examId);
      const cacheKey = `getResultByUsers:${examId}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData) as ExamWithStudentInfo[];
      }
      const result = await ResultScore.aggregate<ExamWithStudentInfo>([
        {
          $match: {
            examId: new ObjectId(examId),
          },
        },
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
            examId: 1,
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
      await redis.set(cacheKey, JSON.stringify(result), "EX", 180);
      return result;
    } catch (error) {
      throw new Error("ResultService.getResultByStatusUsers алдаа: " + error);
    }
  }
  //userId-аар нь шалгалтын мэдээллийг авах
  static async getResultByUserId(
    userId: string
  ): Promise<ExamWithStudentInfo[]> {
    try {
      const cacheKey = `getResultByUsersId:${userId}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData) as ExamWithStudentInfo[];
      }
      const userExists = await User.exists({ _id: new ObjectId(userId) });
      if (!userExists) {
        throw new Error("Хэрэглэгч олдсонгүй.");
      }
      const result = await ResultScore.aggregate<ExamWithStudentInfo>([
        {
          $match: {
            studentId: new ObjectId(userId),
          },
        },
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
            examId: 1,
            startedAt: 1,
            submittedAt: 1,
            score: 1,
            status: 1,
            questions: 1,
            duration: 1,
            "studentInfo._id": 1,
            "examInfo.title": 1,
            "examInfo.key": 1,
            "examInfo.totalScore": 1,
          },
        },
      ]);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 180);
      return result;
    } catch (error) {
      throw new Error("ResultService.getResultByUserId алдаа" + error);
    }
  }

  //examId, studentId хоёр байх юм бол тухайн шалгалтаас хэрэглэгчийн хасах
  static async deleteResultByExamIdByUserId(
    examId: string,
    studentId: string
  ): Promise<DeleteResultResponse> {
    try {
      await validateObjectIds(examId, studentId);
      const result = await ResultScore.deleteOne({
        examId: new ObjectId(examId),
        studentId: new ObjectId(studentId),
      });
      //console.log("blaǎ........", result);
      return result;
    } catch (err) {
      throw new Error("deleteResultByExamIdByUserId алдаа: " + err);
    }
  }

  //examID, studentId 2-ыг match хийж байвал true, байхгүй бол false илгээх, шалгах функц
  static async checkResultByExamUser(
    examId: string,
    studentId: string
  ): Promise<"submitted" | "taking" | "none"> {
    try {
      const result = await ResultScore.findOne({
        examId: new ObjectId(examId),
        studentId: new ObjectId(studentId),
      }).select("status");
      if (!result) return "none";
      return result.status === "submitted" ? "submitted" : "taking";
    } catch (err) {
      throw new Error("checkResultByExamUser алдаа: " + err);
    }
  }

  //Admin хэсэгт буцаах тоон мэдээлэл
  static async getExamTakenCount(): Promise<number> {
    return await ResultScore.countDocuments();
  }

  //monthly ---> chart
  static async getExamTakenPerMonth() {
    try {
      const pipeline: mongoose.PipelineStage[] = [
        {
          $match: {
            submittedAt: { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              $month: {
                $toDate: "$submittedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1 as 1,
          },
        },
      ];

      const result = await ResultScore.aggregate(pipeline);
      return result;
    } catch (error) {
      throw new Error("ResultService.getExamTakenPerMonth алдаа: " + error);
    }
  }
}

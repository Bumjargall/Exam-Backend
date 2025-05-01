import { ObjectId } from "mongodb";
import dbConnect from "../db";
import ResultScore, { IResultScore, ResultStatus } from "../models/ResultScore";
import Exam from "../models/Exam";
import User from "../models/User";

interface ExamWithStudentInfo extends IResultScore {
  studentInfo: {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class ResultService {
  static async createResult(
    resultData: Omit<IResultScore, "_id">
  ): Promise<IResultScore> {
    await dbConnect();
    try {
      const result = await ResultScore.create(resultData);
      return result.toObject();
    } catch (error) {
      throw new Error("CreateResult алдаа: " + error);
    }
  }

  static async getAllResults(): Promise<IResultScore[]> {
    await dbConnect();
    try {
      return await ResultScore.find().lean();
    } catch (error) {
      throw new Error("ResultService.getAllResults алдаа: " + error);
    }
  }

  static async getResultByExamId(examId: string): Promise<IResultScore[]> {
    await dbConnect();
    if(!ObjectId.isValid(examId)) {
        throw new Error("examID шалгахад алдаа гарлаа...");
    }
    try {
      return await ResultScore.find({ examId: new ObjectId(examId) }).lean();
    } catch (error) {
      throw new Error("ResultService.getResultByExamId алдаа: " + error);
    }
  }
  static async updateResult(resultId: string, resultData: Partial<IResultScore>) : Promise<IResultScore | null> {
    await dbConnect();
    try {
        return await ResultScore.findByIdAndUpdate(
            resultId,
            resultData,
            { new: true, runValidators: true }
        ).lean();
    } catch (error) {
        throw new Error("ResultService.updateResult алдаа: " + error);
    }
  }
  static async deleteResult(resultId: string) : Promise<IResultScore | null> {
    await dbConnect();
    if (!ObjectId.isValid(resultId)) {
        throw new Error("ID буруу байна...");
    }
    try {
        const result = await ResultScore.findById(resultId);
        await ResultScore.findByIdAndDelete(resultId);
        return result;
    } catch (error) {
        throw new Error("ResultService.deleteResult алдаа: " + error);
    }
  }
  //result -ын status нь submitted, taking
  static async getResultByStatusUsers(examId: string): Promise<ExamWithStudentInfo[]> {
    await dbConnect();
    if (!ObjectId.isValid(examId)) {
      throw new Error("examID шалгахад алдаа гарлаа...");
    }
    try {
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
            },
            },
        ]);
        return result;
    } catch   (error) {
      throw new Error("ResultService.getResultByStatusUsers алдаа: " + error);
    }
  }


    static async getResultByStudentId(studentId: string): Promise<IResultScore[]> {
        await dbConnect();
        if (!ObjectId.isValid(studentId)) {
        throw new Error("studentID шалгахад алдаа гарлаа...");
        }
        try {
        return await ResultScore.find({ studentId: new ObjectId(studentId) }).lean();
        } catch (error) {
        throw new Error("ResultService.getResultByStudentId алдаа: " + error);
        }
    }

}

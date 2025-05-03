import { ObjectId } from "mongodb";
import dbConnect from "../db";
import ResultScore, { IResultScore, ResultStatus } from "../models/ResultScore";
import Exam from "../models/Exam";
import User from "../models/User";

interface StudentInfo {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface ExamWithStudentInfo extends IResultScore {
  studentInfo: StudentInfo;
}

interface UpdateResultResponse {
  result: IResultScore | null;
  matchedCount: number;
}

interface DeleteResultResponse {
  deletedCount: number;
}

export class ResultService {
  private static async validateIds(...ids: string[]): Promise<void> {
    for (const id of ids) {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ID: ${id}`);
      }
    }
  }

  static async createResult(
    resultData: Omit<IResultScore, "_id">
  ): Promise<IResultScore> {
    await dbConnect();
    try {
      await this.validateIds(
        resultData.examId.toString(),
        resultData.studentId.toString()
      );
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
    await dbConnect();
    try {
      await this.validateIds(resultId);
      const updateResult = await ResultScore.updateOne(
        { _id: new ObjectId(resultId) },
        { $set: resultData }
      );
      const updatedDoc = await ResultScore.findById(resultId).lean();
      return {
        result: updatedDoc,
        matchedCount: updateResult.matchedCount,
      };
    } catch (error) {
      throw new Error("ResultService.updateResult алдаа: " + error);
    }
  }
  static async deleteResult(resultId: string): Promise<DeleteResultResponse> {
    await dbConnect();

    try {
      await this.validateIds(resultId);
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
  static async getResultByUsers(examId: string): Promise<ExamWithStudentInfo[]> {
    await dbConnect();
    try {
      await this.validateIds(examId);
  
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
          },
        },
      ]);
  
      return result;
    } catch (error) {
      throw new Error("ResultService.getResultByStatusUsers алдаа: " + error);
    }
  }
  

}

import {Collection, ObjectId} from "mongodb"
import {client} from "../db"
import Exam from "../models/Exam"
const db  = client.db("Examcom")

export class ExamService {
    private static examsCollection: Collection = db.collection("exams")
    private static studentsCollection: Collection = db.collection("students");

    static async createExam(examData: any) {
        return await this.examsCollection.insertOne(examData)   
    }

    static async getAllExams() {
        return await this.examsCollection.find().toArray()
    }

    static async getExamById(examId: string) {
          if (!ObjectId.isValid(examId)) {
        throw new Error("Invalid exam ID");
    }
        return await this.examsCollection.findOne({_id: new ObjectId(examId)})
    }
    static async updateExam(examId: string, examData: any) {
        if(!ObjectId.isValid(examId)){
            throw new Error("ID буруу байна...")
        }
        const result = await this.examsCollection.updateOne({_id: new ObjectId(examId)}, {$set:examData})
        return result
    }

    static async deleteExam(examId: string) {
        if(!ObjectId.isValid(examId)){
            throw new Error("ID буруу байна...")
        }
        const result =  await this.examsCollection.findOne({_id: new ObjectId(examId)})   
        if(!result){
            throw new Error("Шалгалт олдсонгүй...")
        }

        const deleteExam = await this.examsCollection.deleteOne({_id: new ObjectId(examId)})
        return {
            deleteCount: deleteExam.deletedCount,
            deleteExam: result
        }
    }
    static async getExamsWithStudentInfo() {
        return await this.examsCollection.aggregate([
            {
                $lookup: {
                    from: "students", // The name of the students collection
                    localField: "student_id", // Field in the exams collection
                    foreignField: "_id", // Field in the students collection
                    as: "studentInfo" // The resulting array field
                }
            },
            {
                $unwind: "$studentInfo" // Unwind the studentInfo array to get a single object
            },
            {
                $project: {
                    _id: 1,
                    exam_id: 1,
                    startedAt: 1,
                    submittedAt: 1,
                    score: 1,
                    status: 1,
                    questions: 1,
                    "studentInfo._id": 1,
                    "studentInfo.name": 1,
                    "studentInfo.email": 1 // Include other fields as needed
                }
            }
        ]).toArray();
    }
}
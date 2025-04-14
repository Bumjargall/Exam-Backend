import {Collection, ObjectId} from "mongodb"
import {client} from "../db"

const db  = client.db("Examcom")

export class ExamService {
    private static examsCollection: Collection = db.collection("exams")

    static async createExam(examData: any) {
        return await this.examsCollection.insertOne(examData)   
    }

    static async getAllExams() {
        return await this.examsCollection.find().toArray()
    }

    static async getExamById(examId: string) {
        if(!ObjectId.isValid(examId)){
            throw new Error("ID буруу байна...")
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
        return await this.examsCollection.deleteOne({_id: new ObjectId(examId)})
    }

}
import {ObjectId, Collection} from "mongodb"
import {client} from "../db"

const db = client.db("Examcom")
export class ResultService {
    private static resultCollection: Collection = db.collection("studentsExamScore")
    private static examsCollection: Collection = db.collection("studentsExamScore");

    static async createResult(resultData: any) {
        return await this.resultCollection.insertOne(resultData)
    }

    static async getAllResults() {
        return await this.resultCollection.find().toArray()
    }

    static async getResultByExamId(examId:string) {
        return await this.resultCollection.find({exam_id: new ObjectId(examId)}).toArray()
    }
    static async updateResult(resultId: string, resultData:any) {
        return await this.resultCollection.updateOne(
            {_id: new ObjectId(resultId)},
            {$set:resultData}
        )
    }
    static async deleteResult(resultId:string){
        return await this.resultCollection.deleteOne({_id: new ObjectId(resultId)})
    }
    //result -ын status нь submitted, taking
    static async getResultByStatusUsers(examId: string) {
        return await this.examsCollection.aggregate([
            {
                $match: {
                    exam_id: new ObjectId(examId), // Filter by exam_id instead of _id
                }
            },
            {
                $lookup: {
                    from: "users", // The name of the students collection
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
                    "studentInfo.firstName": 1,
                    "studentInfo.lastName": 1,
                    "studentInfo.email": 1 // Include other fields as needed
                }
            }
        ]).toArray();
    }
}
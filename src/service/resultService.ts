import {ObjectId, Collection} from "mongodb"
import {client} from "../db"

const db = client.db("Examcom")
export class ResultService {
    private static resultCollection: Collection = db.collection("studentsExamScore")
    
    static async createResult(resultData: any) {
        return await this.resultCollection.insertOne(resultData)
    }

    static async getAllResults() {
        return await this.resultCollection.find().toArray()
    }

    static async getResultById(examId:string) {
        return await this.resultCollection.findOne({exam_id: new ObjectId(examId)})
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
    static async getResultByStatusUsers(examId: string, status: string) {
        return await this.resultCollection.find(
            {exam_id: new ObjectId(examId),"status":status}
        ).toArray()
    }
}
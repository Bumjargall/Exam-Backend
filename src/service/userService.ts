import {ObjectId, Collection} from "mongodb";
import {client} from "../db"

const db = client.db("Examcom")
export class UserService {
    private static usersCollection: Collection = db.collection("users")

    static async createUser(userData: any) {
        return await this.usersCollection.insertOne(userData)
    }

    static async getAllUsers() {
        return await this.usersCollection.find().toArray()
    }

    static async getUserById(userId: string) {
        return await this.usersCollection.findOne({_id: new ObjectId(userId)})
    }
    
    static async updateUser(userId: string, userData:any) {
        return await this.usersCollection.updateOne(
            {_id: new ObjectId(userId)},
            {$set: userData}
        )
    }

    static async deleteUser(userId: string) {
        return await this.usersCollection.deleteOne({_id: new ObjectId(userId)})
    }

    //get role users
    static async getUsersByRole(role: string) {
        return await this.usersCollection.find({"role":role}).toArray()
    }
}
import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const url = process.env.DATABASE_URL as string
export const client = new MongoClient(url)

client.connect().then( () => {
    console.log("✅ Connected to MongoDB")
}).catch( (err) => {
    console.log("❌ Failed to connect MongoDB", err)
})
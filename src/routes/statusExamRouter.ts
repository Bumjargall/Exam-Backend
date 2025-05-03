import { Router } from "express";
import { createResult, updateResult, deleteResult,getResultByUsers, getAllResults, getResultByExamId } from "../controllers/statusExamScore";

const statusExamRouter = Router()

statusExamRouter.get("/",getAllResults)
statusExamRouter.get("/:id", getResultByExamId)
//result-д examId -аар хэрэглэгчийн мэдээллийг гаргах
statusExamRouter.get("/by-exam/:examId", getResultByUsers)
statusExamRouter.post("/", createResult)
statusExamRouter.put("/:id", updateResult)
statusExamRouter.delete("/:id", deleteResult)

export default statusExamRouter
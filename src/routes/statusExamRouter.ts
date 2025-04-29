import { Router } from "express";
import { createResult, updateResult, deleteResult,getResultByStatusUsers, getAllResults, getResultByExamId } from "../controllers/statusExamScore";

const statusExamRouter = Router()

statusExamRouter.get("/",getAllResults)
statusExamRouter.get("/:id", getResultByExamId)
statusExamRouter.get("/user/:examId", getResultByStatusUsers)
statusExamRouter.post("/", createResult)
statusExamRouter.put("/:id", updateResult)
statusExamRouter.delete("/:id", deleteResult)

export default statusExamRouter
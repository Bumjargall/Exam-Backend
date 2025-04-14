import { Router } from "express";
import { getResultById, createResult, updateResult, deleteResult, getAllResults } from "../controllers/statusExamScore";

const statusExamRouter = Router()

statusExamRouter.get("/",getAllResults)
statusExamRouter.get("/:id", getResultById)
statusExamRouter.post("/", createResult)
statusExamRouter.put("/:id", updateResult)
statusExamRouter.delete("/:id", deleteResult)

export default statusExamRouter
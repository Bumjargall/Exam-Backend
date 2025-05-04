import { Router } from "express";
import { getAllExams, getExamById, createExam, updateExam, deleteExam } from "../controllers/examController";
import { authenticate } from "../middlewares/auth";

const examRouter = Router();

examRouter.get("/", getAllExams);
examRouter.get("/:id", getExamById);
examRouter.post("/", createExam);
examRouter.put("/:id", updateExam);
examRouter.delete("/:id", deleteExam);

export default examRouter;

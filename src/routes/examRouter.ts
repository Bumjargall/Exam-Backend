import { Router } from "express";
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamByKeyValue,
  getExamByStudent,
} from "../controllers/examController";
import { authenticate } from "../middlewares/auth";
import { get } from "mongoose";

const examRouter = Router();

examRouter.get("/", getAllExams);
examRouter.get("/:id", getExamById);
examRouter.get("/user/:studentId", getExamByStudent);
examRouter.get("/by-key/:key", getExamByKeyValue);
examRouter.post("/", createExam);
examRouter.put("/:id", updateExam);
examRouter.delete("/:id", deleteExam);

export default examRouter;

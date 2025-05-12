import { Router } from "express";
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamByKeyValue,
  updateExamByStatus,
  getExamByCreateUser,
  getExamCount,
  getRecentExams,
  getExamChartData,
} from "../controllers/examController";
import { authenticate } from "../middlewares/auth";
import { get } from "mongoose";

const examRouter = Router();

examRouter.get("/", getAllExams);
examRouter.get("/chart", getExamChartData)
examRouter.get("/count", getExamCount);
examRouter.get("/recent", getRecentExams);
examRouter.get("/:id", getExamById);
examRouter.get("/createByteacher/:id", getExamByCreateUser);
examRouter.get("/by-key/:key", getExamByKeyValue);
examRouter.post("/", createExam);
examRouter.patch("/:id/status", updateExamByStatus);
examRouter.put("/:id", updateExam);
examRouter.delete("/:id", deleteExam);

export default examRouter;

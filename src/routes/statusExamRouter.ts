import { Router } from "express";
import {
  createResult,
  updateResult,
  deleteResult,
  getResultByUsers,
  getExamsWithSubmissions,
  getAllResults,
  getResultByExamId,
  getResultByUserId,
  deleteResultByExamIdByUserId,
  checkResultByExamUser,
  getResultByCreator,
} from "../controllers/statusExamScore";

const statusExamRouter = Router();

statusExamRouter.get("/", getAllResults);
statusExamRouter.get("/by-creator/:userId", getResultByCreator);
statusExamRouter.get("/:id", getResultByExamId);
//result-д examId -аар хэрэглэгчийн мэдээллийг гаргах
statusExamRouter.get("/by-exam/:examId", getResultByUsers);
statusExamRouter.get("/by-user/:userId", getResultByUserId);
statusExamRouter.get("/submitted/exams", getExamsWithSubmissions);
statusExamRouter.get("/checkedResult/:examId/:studentId", checkResultByExamUser);
statusExamRouter.post("/", createResult);
statusExamRouter.put("/:id", updateResult);
statusExamRouter.delete("/:id", deleteResult);
statusExamRouter.delete("/by-exam-user/:examId/:studentId", deleteResultByExamIdByUserId)
export default statusExamRouter;

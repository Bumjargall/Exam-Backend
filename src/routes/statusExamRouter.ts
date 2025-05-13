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
  getExamTakenCount,
} from "../controllers/statusExamScore";

const statusExamRouter = Router();

statusExamRouter.get("/by-creator/:userId", getResultByCreator);

//result-д examId -аар хэрэглэгчийн мэдээллийг гаргах
statusExamRouter.get("/by-exam/:examId", getResultByUsers);
statusExamRouter.get("/by-user/:userId", getResultByUserId);
statusExamRouter.get("/submitted/exams", getExamsWithSubmissions);
statusExamRouter.get(
  "/checkedResult/:examId/:studentId",
  checkResultByExamUser
);
statusExamRouter.get("/taken-count", getExamTakenCount);
statusExamRouter.post("/", createResult);
statusExamRouter.put("/:id", updateResult);
statusExamRouter.delete("/:id", deleteResult);
statusExamRouter.delete(
  "/by-exam-user/:examId/:studentId",
  deleteResultByExamIdByUserId
);
statusExamRouter.get("/", getAllResults);
statusExamRouter.get("/:id", getResultByExamId);

export default statusExamRouter;

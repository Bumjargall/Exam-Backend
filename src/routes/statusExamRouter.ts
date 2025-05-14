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
  getExamTakenPerMonth,
} from "../controllers/statusExamScore";
import { authenticate } from "../../src/middlewares/auth";

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
statusExamRouter.get("/taken/monthly", getExamTakenPerMonth);
statusExamRouter.get("/taken-count", getExamTakenCount);
statusExamRouter.post("/",authenticate, createResult);
statusExamRouter.put("/:id",authenticate, updateResult);
statusExamRouter.delete("/:id",authenticate, deleteResult);
statusExamRouter.delete(
  "/by-exam-user/:examId/:studentId",authenticate,
  deleteResultByExamIdByUserId
);
statusExamRouter.get("/", getAllResults);
statusExamRouter.get("/:id", getResultByExamId);

export default statusExamRouter;

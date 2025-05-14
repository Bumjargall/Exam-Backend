import { Request, Response } from "express";
import { ExamService } from "../service/examService";
import { v4 as uuidv4 } from "uuid";
import { CreateExamInput, IExam } from "../models/Exam";
import { QuestionInput, AnswerOption } from "../models/Exam";
import { date } from "zod";

type QuestionTransformed = {
  id: string;
  quesiton: string;
  score: number;
  type: QuestionInput["type"];
  answer: string[];
  isCorrect: string[];
};

export function transformQuestions(
  questions: QuestionInput[]
): QuestionInput[] {
  if (!Array.isArray(questions)) {
    throw new Error("Асуултын массив байхгүй байна.");
  }

  return questions.map((q) => {
    const noAnswerTypes = ["free-text", "code", "information-block"];

    const answers: AnswerOption[] = Array.isArray(q.answers) ? q.answers : [];

    return {
      id: uuidv4(), // шинэ ID онооно
      question: q.question,
      score: q.score ?? 0,
      type: q.type,
      answers: noAnswerTypes.includes(q.type) ? [] : answers,
    };
  });
}

export const createExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      questions,
      dateTime,
      duration,
      createUserById,
    } = req.body;

    if (!Array.isArray(questions)) {
      res
        .status(400)
        .json({ message: "'questions' талбар алга эсвэл массив биш байна..." });
      return;
    }
    const transformedQuestions = transformQuestions(questions);
    const totalScore = transformedQuestions.reduce(
      (acc, q) => acc + (typeof q.score === "number" ? q.score : 0),
      0
    );

    const newExamData: CreateExamInput = {
      title,
      description,
      questions: transformedQuestions,
      dateTime: new Date(dateTime),
      duration: Number(duration),
      totalScore,
      status: "active",
      key: uuidv4().slice(0, 6),
      createUserById,
    };

    const newExam = await ExamService.createExam(newExamData);
    res.status(200).json({
      status: "success",
      data: {
        exam: newExam,
      },
    });
  } catch (err) {
    console.log("createExam алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа гарсан ..." });
  }
};

export const getAllExams = async (_: Request, res: Response) => {
  try {
    const exams = await ExamService.getAllExams();
    res.status(200).json({
      status: "success",
      results: exams.length,
      data: { exams },
    });
  } catch (err) {
    console.log("getAllExams алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа гарлаа..." });
  }
};

export const getExamById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await ExamService.getExamById(req.params.id);
    if (!exam) {
      res.status(404).json({ message: "Шалгалт олдсонгүй..." });
      return;
    }
    res.status(200).json({ data: exam });
  } catch (err) {
    console.log("getExamById алдаа:", err);
    res.status(500).json({ message: "Сервер алдаагаа шалгана уу..." });
  }
};
export const getExamByCreateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const createUserId = req.params.id;
    const exams = await ExamService.getExamByCreateUser(createUserId);
    if (!exams) {
      res.status(404).json({ message: "Шалгалт олдсонгүй..." });
      return;
    }
    res.status(200).json({ data: exams });
  } catch (err) {
    res.status(500).json({ message: "Сервер алдаагаа шалгана уу..." });
  }
};
export const updateExam = async (req: Request, res: Response) => {
  try {
    const updatedExam = await ExamService.updateExam(req.params.id, req.body);
    res.status(200).json({ data: updatedExam });
  } catch (err) {
    console.log("updateExam алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа гарлаа..." });
  }
};
export const updateExamByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({
        message: "Төлөв зөвхөн 'active' эсвэл 'inactive' байх ёстой.",
      });
      return;
    }
    const updatedExam = await ExamService.updateExamByStatus(
      req.params.id,
      status
    );
    if (!updatedExam) {
      res.status(404).json({ message: "Шалгалт олдсонгүй..." });
      return;
    }
    res.status(200).json({ data: updatedExam });
  } catch (err) {
    console.log("updateExamByStatus алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа гарлаа..." });
  }
};

export const deleteExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await ExamService.deleteExam(req.params.id);
    if (result.deleteCount === 0) {
      res.status(404).json({ message: "Шалгалт олдсонгүй..." });
      return;
    }
    res.status(200).json({
      message: "Амжилттай устгагдлаа...",
      deleteExam: result.deleteExam,
    });
  } catch (err) {
    console.log("deleteExam алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа..." });
  }
};

export const getExamByKeyValue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { key } = req.params;
    const exam = await ExamService.getExamByKeyValue(key);
    if (!exam) {
      res.status(404).json({ message: "Шалгалт олдсонгүй..." });
      return;
    }
    res.status(200).json({ data: exam });
  } catch (err) {
    console.log("getExamByKeyValue алдаа:", err);
    res.status(500).json({ message: "Сервер шалгана уу..." });
  }
};

export const getExamCount = async (req: Request, res: Response) => {
  try {
    const count = await ExamService.getExamCount();
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.log("Count алдаа:", err);
    res.status(500).json({ message: "Сервер шалгана уу..." });
  }
};

export const getRecentExams = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const exams = await ExamService.getRecentExams(limit);
    //console.log("exams/data/controller-----> ", exams);
    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    console.error("алдаа:", error);
    res.status(500).json({ message: "Сервер шалгана уу..." });
  }
};

// chart data
export const getExamChartData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chartData = await ExamService.getExamChartData();
    //.log("controller..data---> ", chartData)

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    console.error("Chart data татахад алдаа гарлаа:", error);
    res.status(500).json({ message: "Сервер шалгана уу..." });
  }
};

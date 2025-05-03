import { Request, Response } from "express";
import { ExamService } from "../service/examService";
import { v4 as uuidv4 } from "uuid";
import { CreateExamInput, IExam } from "../models/Exam";


function transformQuestions(questions: any[]) {
  return questions.map((q) => ({
    text: q.question,
    points: q.score,
    questionType: q.type,
    options: q.answers.map((a: any) => a.text),
    correctAnswer: q.answers
      .filter((a: any) => a.isCorrect)
      .map((a: any) => a.text),
  }));
}


export const createExam = async (req: Request, res: Response) => {
  try {
    const { title, description, questions, dateTime, duration, createUserById } = req.body;
    const transformedQuestions = transformQuestions(questions);
    const totalScore = transformedQuestions.reduce((acc, q) => acc + q.points, 0);

    const newExamData: CreateExamInput = {
      title,
      description,
      questions: transformedQuestions,
      dateTime: new Date(dateTime),
      duration: typeof duration === "number" ? `${duration}m` : duration,
      totalScore,
      status: "active",
      key: uuidv4().slice(0, 6),
      createUserById,
    };

    const newExam = await ExamService.createExam(newExamData);
    res.status(201).json({
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


export const getExamById = async (req: Request, res: Response): Promise<void> => {
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


export const updateExam = async (req: Request, res: Response) => {
  try {
    const updatedExam = await ExamService.updateExam(req.params.id, req.body);
    res.status(200).json({ data: updatedExam });
  } catch (err) {
    console.log("updateExam алдаа:", err);
    res.status(500).json({ message: "Сервер алдаа гарлаа..." });
  }
};


export const deleteExam = async (req: Request, res: Response): Promise<void> => {
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

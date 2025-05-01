import { Request, Response } from "express";
import { ExamService } from "../service/examService";
import { BaseError } from "../utils/BaseError";

export const getAllExams = async (req: Request, res: Response) => {
  try {
    const exams = await ExamService.getAllExams();
    res.status(200).json({ data: exams });
  } catch (err) {
    console.log("Сервер алдаа гарлаа", err);
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
    console.log("Алдаа гарлаа: ", err);
    res.status(500).json({ message: "Сервер алдаагаа шалгана уу..." });
  }
};
export const createExam = async (req: Request, res: Response) => {
  try {
    const newExam = await ExamService.createExam(req.body);
    console.log("Шалгалт амжилттай хадгалагдлаа...", req.body);
    res.status(201).json({ data: newExam });
  } catch (err) {
    console.log("Алдааг шалгах", err);
    res.status(500).json({ message: "Сервер алдаа гарсан ..." });
  }
};
export const updateExam = async (req: Request, res: Response) => {
  try {
    const updateExam = await ExamService.updateExam(req.params.id, req.body);
    res.status(200).json({ data: updateExam });
  } catch (err) {
    console.log("Алдаа гарлаа: ", err);
    res.status(500).json({ message: "Сервер алдаа гарлаа..." });
  }
};
//Promise<void> typeScript_express aldaa zasah
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
    res
      .status(200)
      .json({
        message: "Амжилттай устгагдлаа...",
        deleteExam: result.deleteExam,
      });
  } catch (err) {
    console.log("Алдаа гарлаа: ", err);
    res.status(500).json({ message: "Сервер алдаа..." });
  }
};

import { NextFunction, Request, Response } from "express";
import { ResultService } from "../service/resultService";
import { handleError } from "src/utils/handleError";
export const getAllResults = async (req: Request, res: Response) => {
  try {
    const results = await ResultService.getAllResults();
    res.status(200).json({ data: results });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};

export const getResultByCreator = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const results = await ResultService.getResultByCreator(userId);
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const getResultByExamId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await ResultService.getResultByExamId(req.params.id);
    if (!result || result.length === 0) {
      res.status(404).json({ message: "Шалгалтын мэдээлэл олдсонгүй." });
      return;
    }
    res.status(200).json({ data: result });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const createResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newResult = await ResultService.createResult(req.body.createResult);
    res
      .status(201)
      .json({ message: "Амжилттай хадгалагдлаа", data: newResult });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const updateResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { result, matchedCount } = await ResultService.updateResult(
      req.params.id,
      req.body
    );
    if (matchedCount === 0) {
      res.status(404).json({ message: "Мэдээлэл олдсонгүй." });
      return;
    }

    res.status(200).json({ data: result });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};

export const deleteResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deletedCount } = await ResultService.deleteResult(req.params.id);

    if (deletedCount === 0) {
      res.status(404).json({ message: "Мэдээлэл олдсонгүй." });
      return;
    }

    res.status(200).json({ message: "Устгагдлаа..." });
  } catch (err) {
    handleError(res, err);
    return;
  }
};

export const getExamsWithSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exams = await ResultService.getExamsWithSubmissions();
    res.status(200).json({ success: true, count: exams.length, data: exams });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const getResultByUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await ResultService.getResultByUsers(req.params.examId);
    if (!result || result.length === 0) {
      res.status(404).json({ message: "Шалгалтын мэдээлэл олдсонгүй." });
      return;
    }
    res.status(200).json({ success: true, count: result.length, data: result });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const getResultByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await ResultService.getResultByUserId(req.params.userId);
    if (!result || result.length === 0) {
      res.status(404).json({ message: "Хэрэглэгчийн шалгалт олдсонгүй." });
      return;
    }
    //console.log("result-----+++++++>", result);
    res.status(200).json({ success: true, count: result.length, data: result });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};

export const deleteResultByExamIdByUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { examId, studentId } = req.params;
    const { deletedCount } = await ResultService.deleteResultByExamIdByUserId(
      examId,
      studentId
    );
    if (deletedCount === 0) {
      res.status(404).json({ message: "Мэдээлэл олдсонгүй." });
      return;
    }
    res.status(200).json({ message: "Амжилттай устгагдлаа." });
    return;
  } catch (err) {
    console.log("Алдаа: ", err);
    res.status(500).json({ message: "Сервер алдаа..." });
  }
};

export const checkResultByExamUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId, examId } = req.params;
    const status = await ResultService.checkResultByExamUser(examId, studentId);
    res.status(200).json({ success: true, status });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};
export const getExamTakenCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await ResultService.getExamTakenCount();
    res.status(200).json({ success: true, count });
    return;
  } catch (err) {
    handleError(res, err);
    return;
  }
};

export const getExamTakenPerMonth = async (req: Request, res: Response) => {
  try {
    const data = await ResultService.getExamTakenPerMonth();

    const months = [
      "1-р сар",
      "2-р сар",
      "3-р сар",
      "4-р сар",
      "5-р сар",
      "6-р сар",
      "7-р сар",
      "8-р сар",
      "9-р сар",
      "10-р сар",
      "11-р сар",
      "12-р сар",
    ];

    const formatted = months.map((month, index) => {
      const found = data.find((d) => d._id === index + 1);
      return { month, taken: found?.count || 0 };
    });
    console.log("-----Controller---->", formatted);
    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Ашиглагдсан шалгалтын дата авахад алдаа гарлаа",
      error: err,
    });
  }
};

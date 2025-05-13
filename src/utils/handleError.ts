import { Response } from "express";

export const handleError = (
  res: Response,
  err: unknown,
  message = "Сервер алдаа гарлаа"
) => {
  console.error("Алдаа:", err);
  return res.status(500).json({ message });
};
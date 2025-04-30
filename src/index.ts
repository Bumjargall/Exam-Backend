import express, { Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import examRouter from "./routes/examRouter";
import userRouter from "./routes/userRouter";
import statusExamRouter from "./routes/statusExamRouter";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());
//Routes
app.use("/exams", examRouter);
app.use("/users", userRouter);
app.use("/monitoring", statusExamRouter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Examly холболт амжилттай хийгдлээ..." });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

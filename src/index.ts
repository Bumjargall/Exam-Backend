import express from "express";
import next from "next";
import dbConnect from "./db";
import cors from "cors";
import dotenv from "dotenv";
import examRouter from "./routes/examRouter";
import userRouter from "./routes/userRouter";
import statusExamRouter from "./routes/statusExamRouter";
import { loginUser, resetPassword, sendResetEmail } from "./controllers/userController";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 8080;

async function startServer() {
  try {
    await nextApp.prepare();
    await dbConnect();
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // API Routes
    app.use("/auth/login", loginUser)
    app.use("/api/send-email", sendResetEmail)
    app.post('/reset-password/:token', resetPassword)
    app.use("/exams", examRouter);
    app.use("/users", userRouter);
    app.use("/monitoring", statusExamRouter);

    app.listen(port, () => {
      console.log(`🚀 Server ready on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Сервер алдаа гарлаа: ", err);
    process.exit(1);
  }
}

startServer();

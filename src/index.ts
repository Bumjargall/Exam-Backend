import express from "express";
import next from "next";
import dbConnect from "./db";
import cors from "cors";
import dotenv from "dotenv";
import examRouter from "./routes/examRouter";
import userRouter from "./routes/userRouter";
import statusExamRouter from "./routes/statusExamRouter";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 8080;
dbConnect();

nextApp
  .prepare()
  .then(() => {
    const app = express();
    // Middleware
    app.use(express.json());
    app.use(cors());
    //Routes
    app.use("/exams", examRouter);
    app.use("/users", userRouter);
    app.use("/monitoring", statusExamRouter);

    app.all("*", (req, res) => {
      return handle(req, res);
    })

    // Start Server
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error preparing Next.js:", err);
    process.exit(1);
  });

import express from "express";
import next from "next";
import dbConnect from "./db";
import cors from "cors";
import dotenv from "dotenv";
import examRouter from "./routes/examRouter";
import userRouter from "./routes/userRouter";
import statusExamRouter from "./routes/statusExamRouter";

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
  dev,
  quiet: false, // Show more detailed errors
  customServer: true // Explicitly declare custom server usage
});
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 8080;


dbConnect().then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
})


async function startServer() {
  try {
    await nextApp.prepare();
    
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    /* 
     * API Routes - Add your routes here
     * Example:
     * app.use('/api/exams', examRouter);
     */

    // Next.js handling - SAFE IMPLEMENTATION
    app.get('/_next/*', (req, res) => handle(req, res)); // Next.js internal routes
    app.get('/static/*', (req, res) => handle(req, res)); // Static files
    app.all('*', (req, res) => handle(req, res)); // All other routes

    app.listen(port, () => {
      console.log(`🚀 Server ready on http://localhost:${port}`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

startServer();


{/*  
  nextApp
  .prepare()
  .then(() => {
    
    const nextApp = express();
    // Middleware
    nextApp.use(express.json());
    nextApp.use(cors());
    //Routes
    nextApp.use("/exams", examRouter);
    nextApp.use("/users", userRouter);
    nextApp.use("/monitoring", statusExamRouter);

    nextApp.get("/api/health", (_, res) => {
      res.status(200).json({status: "OK"});
    });

    nextApp.get("/", (_, res) => {
      res.send("Root route is working!");
    });
    nextApp.all("*", (req, res) => {
      return handle(req, res);
    })

    // Start Server
    nextApp.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error preparing Next.js:", err);
    process.exit(1);
  });

  */}
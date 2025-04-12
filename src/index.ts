import express, {Response, Request} from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config()
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req:Request, res:Response) => {
  res.status(200).json({ message: "pong" });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

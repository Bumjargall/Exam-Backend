import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updatePassword,
  forgotPassword,
  resetPassword,
  checkPassword,
} from "../controllers/userController";
import { authenticate } from "../middlewares/auth";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);
userRouter.post("/check-password", checkPassword);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.patch("/:id/role", changeUserRole);
userRouter.patch("/:id/password", updatePassword);
// нууц үг мартсан
// хэрэглэгчийн имэйл рүү токен явуулах
userRouter.post("/forgot-password", forgotPassword);
// нууц үг шинэчлэх

export default userRouter;

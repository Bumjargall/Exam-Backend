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
  getRoleByUser,
  getTeachers,
  getStudents,
  getMonthlyUserGrowth,
} from "../controllers/userController";
import { authenticate } from "../middlewares/auth";
import { useRouter } from "next/router";

const userRouter = express.Router();

userRouter.get("/",authenticate, getAllUsers);
userRouter.get("/role",authenticate, getRoleByUser);
userRouter.get("/role-teachers", getTeachers);
userRouter.get("/role-students", getStudents);
userRouter.get("/growth/monthly",authenticate, getMonthlyUserGrowth);
userRouter.get("/:id", getUserById);
userRouter.post("/",authenticate, createUser);
userRouter.post("/check-password", checkPassword);
userRouter.put("/:id",authenticate, updateUser);
userRouter.delete("/:id",authenticate, deleteUser);
userRouter.patch("/:id/role",authenticate, changeUserRole);
userRouter.patch("/:id/password",authenticate, updatePassword);
// нууц үг мартсан
// хэрэглэгчийн имэйл рүү токен явуулах
userRouter.post("/forgot-password", forgotPassword);
// нууц үг шинэчлэх

export default userRouter;

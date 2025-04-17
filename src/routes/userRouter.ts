import { Router } from "express";
import { createUser, getUserById,updateUser, deleteUser, getAllUsers,loginUser } from "../controllers/userController";

const userRouter = Router();

userRouter.get("/", getAllUsers)
userRouter.get("/:id", getUserById);
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);  

export default userRouter;

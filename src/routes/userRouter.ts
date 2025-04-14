import { Router } from "express";
import { createUser, getUserById,updateUser, deleteUser, getAllUsers } from "../controllers/userController";

const userRouter = Router();

userRouter.get("/", getAllUsers)
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;

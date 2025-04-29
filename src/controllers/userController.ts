import { Request, Response } from "express";
import { UserService } from "../service/userService";
import { BaseError } from "../utils/BaseError";

export const getAllUsers = async (req:Request, res:Response) => {
    try{
        const users = await UserService.getAllUsers()
        if(!users) {
            res.status(400).json({message:"Сервер шалгах..."})
        }
        res.status(200).json({data: users})
    } catch(err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message: "Сервер алдаа гарлаа..."})
    }
}
export const getUserById = async (req:Request, res: Response):Promise<void> => {
    try {
        const userId = req.params.id
        const user = await UserService.getUserById(userId)
        if(!user) {
            res.status(404).json({message: "Хэрэглэгч олдсонгүй..."})
            return;
        }
        res.status(200).json({data: user})
    } catch(err) {
        console.log("Алдаа: ",err)
        res.status(500).json({message: "Сервер алдаагаа шалгана уу..."})
    }
}
export const getUserByExamId = async (req:Request, res:Response):Promise<void> => {
    try {
        const examId = req.params.examId
        const user = await UserService.getUserByExamId(examId)
    } catch(err) {
console.log("Алдаа: ",err)
        res.status(500).json({message: "Сервер алдаагаа шалгана уу..."})
    }
}
export const loginUser = async (req:Request, res: Response)=> {
    try{
        const { email, password } = req.body;
  
        // Email болон password шалгах
        if (!email || !password) {
            res.status(400).json({ message: "Email болон нууц үг шаардлагатай." });
            return;
        }

        // Хэрэглэгчийг email-аар хайх
        const user = await UserService.findByEmail(email);

        if (!user) {
            res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });
            return;
        }
      
        // Нууц үг шалгах
        const isPasswordValid = await UserService.comparePassword(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Нууц үг буруу байна." });
            return;
        }

  
        // Token үүсгэх
        const token = UserService.generateToken(user);
        console.log( { ok:true, message: "Амжилттай нэвтэрлээ.", token, user });
        res.status(200).json({ ok:true, message: "Амжилттай нэвтэрлээ.", token, user });
     
    } catch(err){
        console.log("Алдаа: ",err)
        res.status(500).json({message: "Сервер алдаагаа шалгана уу..."})
    }
}
export const createUser = async (req:Request, res:Response) => {
    try {
        const newUser = await UserService.createUser(req.body)
        res.status(201).json({message: "Хэрэглэгч амжилттай бүртгэгдлээ...", data: newUser})
    } catch (err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message: "Алдаагаа шалгаарай..."})
    }
}
export const updateUser = async (req:Request, res:Response) => {
    try{
        const updateUser = await UserService.updateUser(req.params.id, req.body)
        res.status(200).json({data: updateUser})
    } catch(err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message: "Сервер алдаагаа шалгана уу..."})
    }
}

export const deleteUser = async(req:Request, res:Response):Promise<void> => {
    try{
        const result = await UserService.deleteUser(req.params.id)
        if(result.deletedCount===0){
            res.status(404).json({message: "Хэрэглэгчийн мэдээлэл олдсонгүй..."})
            return;
        }
        res.status(200).json({message: "Амжилттай устгагдлаа"})
    } catch(err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message: "Сервер алдаагаа шалгах..."})
    }
}
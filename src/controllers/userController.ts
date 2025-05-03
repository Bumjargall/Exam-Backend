import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/userService";
import User from "src/models/User";

export const getAllUsers:RequestHandler = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById : RequestHandler = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: "Хэрэглэгч олдсонгүй" 
      });
    }
    res.status(200).json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        message: "Имэйл болон нууц үг шаардлагатай" 
      });
      return;
    }

    const user = await UserService.findByEmail(email);
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: "И-мэйл бүртгэлгүй байна" 
      });
      return;
    }
    const isPasswordValid = await UserService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Нэвтрэх мэдээлэл буруу байна"
      });
      return;
    }

    const token = UserService.generateToken(user);
    const { password: _removed, ...userWithoutPassword } = user;
    res.status(200).json({ 
      success: true,
      message: "Амжилттай нэвтэрлээ",
      token,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Алдаа: ", error);
    next(error);
  }
};

export const createUser :RequestHandler = async (req, res, next) => {
  try {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "Хэрэглэгч амжилттай бүртгэгдлээ",
      data: newUser
    });
  } catch (error) {
    console.error("Алдаа: ", error);
    next(error);
  }
};

export const updateUser :RequestHandler = async (req, res, next) => {
  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      res.status(404).json({ 
        success: false,
        message: "Хэрэглэгч олдсонгүй" 
      });
      return;
    }
    res.status(200).json({ 
      success: true,
      data: updatedUser 
    });
  } catch (error) {
    console.error("Алдаа: ", error);
    next(error);
  }
};

export const deleteUser :RequestHandler = async (req, res, next) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: "Хэрэглэгч олдсонгүй" 
      });
      return;
    }
    res.status(200).json({ 
      success: true,
      message: "Амжилттай устгагдлаа",
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole : RequestHandler = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updatedUser = await UserService.changeUserRole(req.params.id, role);
    if (!updatedUser) {
      res.status(404).json({ 
        success: false,
        message: "Хэрэглэгч олдсонгүй" 
      });
      return;
    }
    res.status(200).json({ 
      success: true,
      data: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword :RequestHandler = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    await UserService.updatePassword(req.params.id, newPassword);
    res.status(200).json({ 
      success: true,
      message: "Нууц үг амжилттай шинэчлэгдлээ" 
    });
  } catch (error) {
    next(error);
  }
};
import { Request, Response } from "express";
import { ResultService } from "../service/resultService";

export const getAllResults = async(req:Request, res:Response) => {
    try {
        const results = await ResultService.getAllResults()
        res.status(200).json({data:results})
    } catch(err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message:"Сервер шалгах..."})
    }
}
export const getResultById = async ( req:Request, res:Response):Promise<void> => {
    try {
        const resultId = req.params.id
        const result = await ResultService.getResultById(resultId)
        if(!result){
            res.status(404).json({message:"Шалгалтын мэдээлэл байхгүй..."})
            return
        }
        res.status(200).json({data: result})
    } catch (err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message:"Сервер алдаа гарлаа..."})
    }
}
export const createResult = async (req:Request, res:Response):Promise<void> => {
    try {
        const newResult = await ResultService.createResult(req.body)
        res.status(201).json({message: "Амжилттай хадгалагдлаа...", data:newResult})
    } catch(err) {
        console.log("Алдаа гарлаа", err)
        res.status(500).json({message:"Сервер алдаа гарлаа..."})
    }
}
export const updateResult = async (req: Request, res: Response):Promise<void> => {
    try {
        const updateResult = await ResultService.updateResult(req.params.id, req.body)
        if(updateResult.matchedCount===0){
            res.status(404).json({message:"Мэдээлэл олдсонгүй..."})
            return
        }
        res.status(200).json({data:updateResult})
    } catch(err) {
        console.log("Алдаа: ", err)
        res.status(500).json({message:"Сервер алдааг шалгах ..."})
    }
}

export const deleteResult = async(req:Request, res:Response):Promise<void> => {
    try {
        const result = await ResultService.deleteResult(req.params.id)
        if(result.deletedCount===0) {
            res.status(404).json({message:"Мэдээлэл олдсонгүй..."})
            return
        }
        res.status(200).json({message:"Устгагдлаа..."})
    } catch(err){
        console.log("Алдаа: ", err)
        res.status(500).json({message:"Сервер алдаа..."})
    }
}
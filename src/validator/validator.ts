import {z} from "zod"

export const isNumber = z.object({
    id:z.string().regex(/^\d+$/, "Зөвхөн тоо оруулна уу...")
})
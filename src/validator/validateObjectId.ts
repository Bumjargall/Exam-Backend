import { ObjectId } from "mongodb";

export function validateObjectId(id: string, name = "ID") {
  if (!ObjectId.isValid(id)) {
    throw new Error(`${name} буруу байна.`);
  }
}
import { ObjectId } from "mongodb";

export function validateObjectIds(...ids: string[]): void {
  for (const id of ids) {
    if (!ObjectId.isValid(id)) {
      throw new Error(`Буруу ID: ${id}`);
    }
  }
}

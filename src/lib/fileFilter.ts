import { NextFunction, Request, Response } from "express";
import { fromBuffer } from "file-type";
import { ApiError } from "../utils/api-error";
import core from "file-type/core";

export const fileFilter = (allowedTypes: core.MimeType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files) {
      return next(); // Jika tidak ada file, langsung lanjut (atau bisa throw error tergantung kebutuhan)
    }

    for (const fieldname in files) {
      const fieldArray = files[fieldname];

      for (const file of fieldArray) {
        if (!file || !file.buffer) {
          throw new ApiError(`File is missing or invalid`, 400);
        }

        const type = await fromBuffer(file.buffer);
        if (!type || !allowedTypes.includes(type.mime)) {
          throw new ApiError(`File type ${type?.mime} is not allowed`, 400);
        }
      }
    }

    next();
  };
};

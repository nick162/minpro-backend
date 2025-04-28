import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const verifyRole = (roles: string[]) => {
  // Roles dalam bentuk string agar nanti di route bisa dikirim
  return (req: Request, res: Response, next: NextFunction) => {
    // Tampung role lebih dahulu dalam response
    const userRole = res.locals.user.role;

    // cek jika rolesnya tidak ada dan bukan role yang diinginkan
    if (!userRole || !roles.includes(userRole)) {
      throw new ApiError("Unauthorization", 403);
    }
    next();
  };
};

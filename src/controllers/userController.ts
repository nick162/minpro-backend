import { Request, Response, NextFunction } from "express";
import { getUsersService } from "../services/user/getUsersService";
import { getUserService } from "../services/user/getUserService";

// GET ALL USERS
export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.page as string) || 3,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "createdAt",
      search: (req.query.search as string) || "",
    };
    const result = await getUsersService(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE USER
export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id);
    const result = await getUserService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// // UPDATE USER
// export const updateUserController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = parseInt(req.params.id);
//     const result = await userService.updateUserService(userId, req.body, req.file);
//     res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

// // SOFT DELETE USER
// export const deleteUserController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = parseInt(req.params.id);
//     const result = await userService.deleteUserService(userId);
//     res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

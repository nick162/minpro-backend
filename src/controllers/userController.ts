import { Request, Response, NextFunction } from "express";
import { getUsersService } from "../services/user/getUsersService";
import { getUserService } from "../services/user/getUserService";
import { updateUserProfileService } from "../services/user/updateUserService";
import { createToken } from "../lib/jwtToken";
import prisma from "../config/prisma";

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

export const updateUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = res.locals.user.role;
    const profilePict = (
      req.files as { [fieldname: string]: Express.Multer.File[] }
    )?.profilePict?.[0];

    if (!["CUSTOMER", "EVENT_ORGANIZER"].includes(role)) {
      return res
        .status(403)
        .send({ message: "Role not allowed to update profile" });
    }

    const result = await updateUserProfileService(
      res.locals.user.id,
      req.body,
      profilePict
    );

    // // Ambil data user terbaru dari database
    // const user = await prisma.user.findUnique({
    //   where: { id: updated.id },
    // });

    // if (!user) {
    //   return res.status(404).send({ message: "User not found after update" });
    // }

    // // Buat token baru berdasarkan data user yang telah diperbarui
    // const newToken = createToken({
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   role: user.role,
    //   profilePict: user.profilePict,
    // });

    // // Buat hasil response
    // const result = {
    //   message: "Profile updated successfully",
    //   user,
    //   token: newToken,
    // };

    // Kirim response lengkap
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

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

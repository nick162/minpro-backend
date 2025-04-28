import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryUpload, cloudinaryRemove } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateUserPrismaService = async (
  id: string,
  body: Partial<User>,
  profileImage?: Express.Multer.File
) => {
  const user = await prisma.user.findFirst({
    where: { id: Number(id) },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (body.email && body.email !== user.email) {
    const existingEmail = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exists", 400);
    }
  }

  let imageUrl = user.profilePict;

  if (profileImage) {
    // Optional: hapus foto lama dari Cloudinary jika ada
    if (user.profilePict) {
      try {
        // Ambil public_id dari URL cloudinary
        const publicId = user.profilePict.split("/").pop()?.split(".")[0];
        if (publicId) await cloudinaryRemove(publicId);
      } catch (err) {
        console.warn("Failed to delete old image from Cloudinary:", err);
      }
    }

    // Upload foto baru
    const uploaded = await cloudinaryUpload(profileImage);
    imageUrl = uploaded.secure_url;
  }

  const updateUser = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      ...body,
      profilePict: imageUrl,
    },
  });

  const { password, ...updatedUserWithoutPassword } = updateUser;

  return updatedUserWithoutPassword;
};

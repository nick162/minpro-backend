import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { sign } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config/env";

export const updateUserProfileService = async (
  id: number,
  body: Partial<User>,
  profileImage?: Express.Multer.File
) => {
  const user = await prisma.user.findFirst({ where: { id } });
  if (!user) throw new ApiError("User not found", 404);

  if (body.email && body.email !== user.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email: body.email },
    });
    if (emailTaken) throw new ApiError("Email already exists", 400);
  }

  let imageUrl = user.profilePict;

  if (profileImage) {
    if (user.profilePict) {
      try {
        const publicId = user.profilePict.split("/").pop()?.split(".")[0];
        if (publicId) await cloudinaryRemove(publicId);
      } catch (e) {
        console.warn("Cloudinary remove error:", e);
      }
    }
    const uploaded = await cloudinaryUpload(profileImage);
    imageUrl = uploaded.secure_url;
  }
  const tokenPayload = { id: user.id, role: user.role };

  // Lalu kita akan mengambil token untuk dikirim nantinya agar tau usernya juga
  const token = sign(tokenPayload, JWT_SECRET_KEY!, {
    expiresIn: "2h",
  });
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...body,
      profilePict: imageUrl,
    },
  });

  const { password, ...userWithoutPassword } = updated;
  return { ...userWithoutPassword, accessToken: token };
};

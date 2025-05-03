import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { comparePassword } from "../../lib/argon";
import { JWT_SECRET_KEY } from "../../config/env";
import { sign } from "jsonwebtoken";

export const loginService = async (
  body: Pick<User, "username" | "password">
) => {
  // Ambil username dan password yang akan dikirimkan dalam body
  const { username, password } = body;
  const user = await prisma.user.findFirst({
    where: { username },
  });

  // Kalo tidak ada usernamenya, throw erroe
  if (!user) {
    throw new ApiError("Username not found", 401);
  }

  // Compare password yang dimasukan ke dalam variable dan hash password teersebut
  const isPassword = await comparePassword(password, user.password);

  // kalo tidak ada dalam db maka thriw error
  if (!isPassword) {
    throw new ApiError("Invalid password", 401);
  }

  // Ketika login kita juga akan mengambil user id dan juga rolenya
  const tokenPayload = { id: user.id, role: user.role };

  // Lalu kita akan mengambil token untuk dikirim nantinya agar tau usernya juga
  const token = sign(tokenPayload, JWT_SECRET_KEY!, {
    expiresIn: "2h",
  });

  const { password: pw, ...userWithoutPassword } = user;

  // Kirim user dan tokennya juga
  return { ...userWithoutPassword, accessToken: token };
};

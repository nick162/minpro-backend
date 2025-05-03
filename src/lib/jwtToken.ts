import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/env"; // kamu sudah punya ini

interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  profilePict?: string | null;
}

export const createToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY!, { expiresIn: "7d" });
};

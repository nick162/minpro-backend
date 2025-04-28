import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/authController";
import { validateLogin } from "../validator/auth.validator";

const router = Router();

router.post("/register", registerController);
router.post("/login", validateLogin, loginController);

export default router;

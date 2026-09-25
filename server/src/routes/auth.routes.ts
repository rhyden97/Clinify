import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware.js";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware.js";
import { LoginSchema, UpdateProfileSchema } from "../schemas/auth.schema.js";
import { PatientRegisterSchema } from "../schemas/patients.schema.js";
import { login, register, getCurrentUser, updateProfile } from "../controllers/auth.controllers.js";

export const authRouter: Router = Router();

authRouter.post("/login", validateBody(LoginSchema), login);
authRouter.post("/register", validateBody(PatientRegisterSchema), register);
authRouter.get("/me", authenticateMiddleware, getCurrentUser);
authRouter.post("/update-profile", validateBody(UpdateProfileSchema), authenticateMiddleware, updateProfile);

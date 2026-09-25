import type { Request, Response, NextFunction } from "express";
import type { LoginType, LoginResponse } from "../schemas/auth.schema.js";
import type { PatientRegisterType } from "../schemas/patients.schema.js";
import { authenticateUser, registerPatientUser, findUserProfileById } from "../services/auth.services.js";
import type { JwtPayloadType } from "../schemas/auth.schema.js";

export const login = async (req: Request<{}, {}, LoginType>, res: Response<LoginResponse>, next: NextFunction) => {
  try {
    const loginData = req.body;
    const { token, user } = await authenticateUser(loginData);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request<{}, {}, PatientRegisterType>, res: Response<LoginResponse>, next: NextFunction) => {
  try {
    const userRegisterData = req.body;
    const { token, user } = await registerPatientUser(userRegisterData);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request<{}, {}, {}, { user: JwtPayloadType }>, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const data = await findUserProfileById(user?.userId, user?.role);
    return res.status(200).json({ success: true, user: data });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (_req: Request<{}, {}, {}, { user?: JwtPayloadType }>, res: Response, _next: NextFunction) => {
  return res.status(200).json({ success: true, message: "Profile update functionality is not implemented yet." });
};

import type { Request, Response, NextFunction } from "express";
import {
  findAllUsers,
  findUserById,
  updateUserStatus as updateUserStatusService,
} from "../services/users.services.js";
import type { UserQueryType } from "../schemas/users.schema.js";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await findAllUsers(req.query as UserQueryType);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await findUserById(id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const user = await updateUserStatusService(id, status);
    return res.status(200).json({ success: true, message: "User status updated successfully", user });
  } catch (error) {
    next(error);
  }
};

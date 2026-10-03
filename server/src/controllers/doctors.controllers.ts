import type { Request, Response, NextFunction } from "express";
import type { QueryDoctorDirectoryType } from "../schemas/request.schema.js";
import {
  findDoctorDirectory,
  findDoctorById,
  registerDoctor as registerDoctorService,
  updateDoctor as updateDoctorService,
  findDoctorSchedules,
  setDoctorSchedules as setDoctorSchedulesService,
  findDoctorAvailableSlots,
} from "../services/doctors.services.js";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";

export const getDoctorDirectory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty_id, search } = req.query as QueryDoctorDirectoryType;
    const result = await findDoctorDirectory(specialty_id, search);
    return res.status(200).json({ success: true, message: "Doctor directory retrieved successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("Doctor ID is required");
    const result = await findDoctorById(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerDoctorService(req.body);
    return res.status(201).json({ success: true, message: "Doctor registered successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("Doctor ID is required");

    if (req.user.role === "doctor" && req.user.specificId !== id) {
      throw new ForbiddenError("You can only update your own doctor profile");
    }

    const result = await updateDoctorService(id, req.body);
    return res.status(200).json({ success: true, message: "Doctor updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const getDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("Doctor ID is required");
    const result = await findDoctorSchedules(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const setDoctorSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("Doctor ID is required");

    if (req.user.role === "doctor" && req.user.specificId !== id) {
      throw new ForbiddenError("You can only modify your own schedules");
    }

    const result = await setDoctorSchedulesService(id, req.body);
    return res.status(200).json({ success: true, message: "Schedules configured successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { date } = req.query;
    if (!id) throw new BadRequestError("Doctor ID is required");
    if (!date || typeof date !== "string") {
      throw new BadRequestError("Date query parameter (?date=YYYY-MM-DD) is required");
    }
    const result = await findDoctorAvailableSlots(id, date);
    return res.status(200).json({ success: true, date, available_slots: result });
  } catch (error) {
    next(error);
  }
};
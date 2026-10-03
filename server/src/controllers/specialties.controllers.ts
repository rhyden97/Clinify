import type { Request, Response, NextFunction } from "express";
import {
  findAllSpecialties,
  findSpecialtyById,
  createSpecialty as createSpecialtyService,
  updateSpecialty as updateSpecialtyService,
  deleteSpecialty as deleteSpecialtyService,
} from "../services/specialties.services.js";

export const getAllSpecialties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await findAllSpecialties();
    return res.status(200).json({ success: true, specialties: data });
  } catch (error) {
    next(error);
  }
};

export const getSpecialtyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await findSpecialtyById(id);
    return res.status(200).json({ success: true, specialty: data });
  } catch (error) {
    next(error);
  }
};

export const createSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createSpecialtyService(req.body);
    return res.status(201).json({ success: true, message: "Specialty created successfully", specialty: data });
  } catch (error) {
    next(error);
  }
};

export const updateSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await updateSpecialtyService(id, req.body);
    return res.status(200).json({ success: true, message: "Specialty updated successfully", specialty: data });
  } catch (error) {
    next(error);
  }
};

export const deleteSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await deleteSpecialtyService(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

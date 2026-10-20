import type { Request, Response, NextFunction } from "express";
import {
  findTreatmentsByConsultationId,
  createTreatment as createTreatmentService,
  deleteTreatment as deleteTreatmentService,
} from "../services/treatments.services.js";
import { BadRequestError } from "../utils/errors.js";

export const getTreatmentsByConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultationId = req.params.consultation_id as string;
    if (!consultationId) throw new BadRequestError("Consultation ID is required");
    const result = await findTreatmentsByConsultationId(consultationId);
    return res.status(200).json({ success: true, treatments: result });
  } catch (error) {
    next(error);
  }
};

export const createTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await createTreatmentService(req.body);
    return res.status(201).json({ success: true, message: "Treatment added successfully", treatment: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("Treatment ID is required");
    const result = await deleteTreatmentService(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

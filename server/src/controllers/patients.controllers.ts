import type { Request, Response, NextFunction } from "express";
import {
  findAllPatients,
  findPatientById,
  updatePatient as updatePatientService,
  findMedicalRecordByPatientId,
  upsertMedicalRecord as upsertMedicalRecordService,
} from "../services/patients.services.js";
import { ForbiddenError } from "../utils/errors.js";
import type { PaginationQueryType } from "../schemas/request.schema.js";

export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await findAllPatients(req.query as PaginationQueryType);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (req.user.role === "patient" && req.user.specificId !== id) {
      throw new ForbiddenError("You are not allowed to view other patients' profiles");
    }

    const patient = await findPatientById(id);
    return res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (req.user.role === "patient" && req.user.specificId !== id) {
      throw new ForbiddenError("You can only update your own patient profile");
    }

    const patient = await updatePatientService(id, req.body);
    return res.status(200).json({ success: true, message: "Patient updated successfully", patient });
  } catch (error) {
    next(error);
  }
};

export const getMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (req.user.role === "patient" && req.user.specificId !== id) {
      throw new ForbiddenError("You are not allowed to view this medical record");
    }

    const record = await findMedicalRecordByPatientId(id);
    return res.status(200).json({ success: true, medical_record: record });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const record = await upsertMedicalRecordService(id, req.body);
    return res.status(200).json({ success: true, message: "Medical record updated successfully", medical_record: record });
  } catch (error) {
    next(error);
  }
};

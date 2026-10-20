import type { Request, Response, NextFunction } from "express";
import {
  createMedicalFile as createMedicalFileService,
  findMedicalFilesByPatient,
  deleteMedicalFile as deleteMedicalFileService,
} from "../services/medical_files.services.js";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";
import type { MedicalFilesQueryType } from "../schemas/medical_files.schema.js";

export const uploadMedicalFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId || (req.user as any).id;
    if (!userId) throw new BadRequestError("User identification required");

    const result = await createMedicalFileService(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Medical file metadata registered successfully",
      file: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicalFilesByPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patient_id as string;
    if (!patientId) throw new BadRequestError("Patient ID is required");

    if (req.user.role === "patient" && req.user.specificId !== patientId) {
      throw new ForbiddenError("You can only access your own medical files");
    }

    const { category } = req.query as MedicalFilesQueryType;
    const files = await findMedicalFilesByPatient(patientId, category);
    return res.status(200).json({ success: true, files });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicalFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) throw new BadRequestError("File ID is required");

    const result = await deleteMedicalFileService(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

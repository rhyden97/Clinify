import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { UploadMedicalFileInputSchema, MedicalFilesQuerySchema } from "../schemas/medical_files.schema.js";
import { ParamsIdSchema, ParamsPatientIdSchema } from "../schemas/request.schema.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  uploadMedicalFile,
  getMedicalFilesByPatient,
  deleteMedicalFile,
} from "../controllers/medical_files.controllers.js";

export const medicalFilesRouter: Router = Router();

medicalFilesRouter.post(
  "/upload",
  authorizeRoles("doctor", "admin", "patient"),
  validateBody(UploadMedicalFileInputSchema),
  uploadMedicalFile
);

medicalFilesRouter.get(
  "/patient/:patient_id",
  validateParams(ParamsPatientIdSchema),
  validateQuery(MedicalFilesQuerySchema),
  getMedicalFilesByPatient
);

medicalFilesRouter.delete(
  "/:id",
  authorizeRoles("doctor", "admin"),
  validateParams(ParamsIdSchema),
  deleteMedicalFile
);

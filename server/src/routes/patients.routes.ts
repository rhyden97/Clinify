import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { PatientUpdateSchema } from "../schemas/patients.schema.js";
import { UpsertMedicalRecordSchema } from "../schemas/medical_records.schema.js";
import { ParamsIdSchema, PaginationQuerySchema } from "../schemas/request.schema.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getAllPatients,
  getPatientById,
  updatePatient,
  getMedicalRecord,
  updateMedicalRecord,
} from "../controllers/patients.controllers.js";

export const patientsRouter: Router = Router();

patientsRouter.get("/", authorizeRoles("admin", "doctor"), validateQuery(PaginationQuerySchema), getAllPatients);
patientsRouter.get("/:id", validateParams(ParamsIdSchema), getPatientById);
patientsRouter.put("/:id", validateParams(ParamsIdSchema), validateBody(PatientUpdateSchema), updatePatient);
patientsRouter.get("/:id/medical-record", validateParams(ParamsIdSchema), getMedicalRecord);
patientsRouter.put("/:id/medical-record", authorizeRoles("admin", "doctor"), validateParams(ParamsIdSchema), validateBody(UpsertMedicalRecordSchema), updateMedicalRecord);

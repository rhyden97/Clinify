import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { ConsultationSchema } from "../schemas/consultations.schema.js";
import {
  createConsultation,
  getConsultationByAppointmentId,
  getConsultationsByPatientId,
  getConsultationById,
} from "../controllers/consultations.controllers.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  ParamsIdSchema,
  ParamsAppointmentIdSchema,
  ParamsPatientIdSchema,
} from "../schemas/request.schema.js";

export const consultationsRouter: Router = Router();

consultationsRouter.post("/", authorizeRoles("doctor"), validateBody(ConsultationSchema), createConsultation);
consultationsRouter.get("/appointment/:appointment_id", validateParams(ParamsAppointmentIdSchema), getConsultationByAppointmentId);
consultationsRouter.get("/patient/:patient_id", validateParams(ParamsPatientIdSchema), getConsultationsByPatientId);
consultationsRouter.get("/:id", validateParams(ParamsIdSchema), getConsultationById);

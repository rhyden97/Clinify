import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { TreatmentSchema } from "../schemas/treatments.schema.js";
import { ParamsIdSchema, ParamsConsultationIdSchema } from "../schemas/request.schema.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getTreatmentsByConsultation,
  createTreatment,
  deleteTreatment,
} from "../controllers/treatments.controllers.js";

export const treatmentsRouter: Router = Router();

treatmentsRouter.get(
  "/consultation/:consultation_id",
  validateParams(ParamsConsultationIdSchema),
  getTreatmentsByConsultation
);

treatmentsRouter.post(
  "/",
  authorizeRoles("doctor"),
  validateBody(TreatmentSchema),
  createTreatment
);

treatmentsRouter.delete(
  "/:id",
  authorizeRoles("doctor"),
  validateParams(ParamsIdSchema),
  deleteTreatment
);

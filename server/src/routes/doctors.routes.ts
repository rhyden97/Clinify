import { Router } from "express";
import { validateBody, validateQuery, validateParams } from "../middlewares/validate.middleware.js";
import { DoctorRegistrationSchema, DoctorUpdateSchema } from "../schemas/doctors.schema.js";
import { SetDoctorScheduleSchema } from "../schemas/doctor_schedules.schema.js";
import {
  getDoctorDirectory,
  getDoctorById,
  registerDoctor,
  updateDoctor,
  getDoctorSchedules,
  setDoctorSchedules,
  getDoctorAvailableSlots,
} from "../controllers/doctors.controllers.js";
import {
  QueryDoctorDirectorySchema,
  ParamsIdSchema,
  AvailableSlotsQuerySchema,
} from "../schemas/request.schema.js";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

export const doctorsRouter: Router = Router();

doctorsRouter.get("/", validateQuery(QueryDoctorDirectorySchema), getDoctorDirectory);
doctorsRouter.get("/:id", validateParams(ParamsIdSchema), getDoctorById);
doctorsRouter.post("/", authenticateMiddleware, authorizeRoles("admin"), validateBody(DoctorRegistrationSchema), registerDoctor);
doctorsRouter.put("/:id", authenticateMiddleware, validateParams(ParamsIdSchema), authorizeRoles("doctor", "admin"), validateBody(DoctorUpdateSchema), updateDoctor);
doctorsRouter.get("/:id/schedules", validateParams(ParamsIdSchema), getDoctorSchedules);
doctorsRouter.post("/:id/schedules", authenticateMiddleware, validateParams(ParamsIdSchema), authorizeRoles("doctor", "admin"), validateBody(SetDoctorScheduleSchema), setDoctorSchedules);
doctorsRouter.get("/:id/available-slots", validateParams(ParamsIdSchema), validateQuery(AvailableSlotsQuerySchema), getDoctorAvailableSlots);

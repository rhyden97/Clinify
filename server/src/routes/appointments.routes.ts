import { Router } from "express";
import { validateBody, validateQuery, validateParams } from "../middlewares/validate.middleware.js";
import { AppointmentSchema, AppointmentStatusSchema } from "../schemas/appointment.schema.js";
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
} from "../controllers/appointments.controllers.js";
import { GetAppointmentsQuerySchema, GetAppointmentByIdParamsSchema } from "../schemas/appointment.schema.js";

export const appointmentsRouter: Router = Router();

appointmentsRouter.get("/", validateQuery(GetAppointmentsQuerySchema), getAppointments);
appointmentsRouter.post("/", validateBody(AppointmentSchema), createAppointment);
appointmentsRouter.get("/:id", validateParams(GetAppointmentByIdParamsSchema), getAppointmentById);
appointmentsRouter.patch("/:id/status", validateParams(GetAppointmentByIdParamsSchema), validateBody(AppointmentStatusSchema), updateAppointmentStatus);

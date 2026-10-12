import type { Request, Response, NextFunction } from "express";
import type { GetAppointmentsQueryType } from "../schemas/appointment.schema.js";
import type { JwtPayloadType } from "../schemas/auth.schema.js";
import type { AppointmentType } from "../schemas/appointment.schema.js";
import {
  findAppointments,
  createAppointment as createAppointmentService,
  findAppointmentById,
  updateAppointmentStatus as updateAppointmentStatusService,
} from "../services/appointments.services.js";

export const getAppointments = async (
  req: Request<{}, {}, {}, GetAppointmentsQueryType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = req.query;
    const user = req.user;

    const result = await findAppointments({
      filters,
      user,
    });

    return res.status(200).json({
      success: true,
      appointments: result.appointments,
      total: result.count,
      page: result.page,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (
  req: Request<{}, {}, AppointmentType, {}, JwtPayloadType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const user = req.user;

    const finalPatientId =
      user.role === "patient" ? user.specificId : data.patient_id;

    const finalDoctorId =
      user.role === "doctor" ? user.specificId : data.doctor_id;

    if (!finalPatientId || !finalDoctorId) {
      return res.status(400).json({
        success: false,
        message:
          "Se requieren tanto el paciente como el doctor para agendar la cita.",
      });
    }

    data.patient_id = finalPatientId;
    data.doctor_id = finalDoctorId;

    const result = await createAppointmentService(data);

    return res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const appointmentId = req.params.id as string;
    const result = await findAppointmentById(appointmentId);
    return res.status(200).json({
      success: true,
      appointment: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const appointmentId = req.params.id as string;
    const { status } = req.body;

    const result = await updateAppointmentStatusService(appointmentId, status);

    return res.status(200).json({
      success: true,
      appointment: result,
    });
  } catch (error) {
    next(error);
  }
};
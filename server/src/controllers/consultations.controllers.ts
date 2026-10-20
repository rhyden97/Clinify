import type { Request, Response, NextFunction } from "express";
import {
  createConsultation as createConsultationService,
  findConsultationByAppointmentId,
  findConsultationsByPatientId,
  findConsultationById,
} from "../services/consultations.services.js";
import { BadRequestError } from "../utils/errors.js";

export const createConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user.specificId;
    const consultationData = req.body;

    if (doctorId) {
      consultationData.doctor_id = doctorId;
    }

    const result = await createConsultationService(consultationData);
    return res.status(201).json({
      success: true,
      message: "Consultation created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointmentId = req.params.appointment_id as string;
    if (!appointmentId) {
      throw new BadRequestError("Appointment ID is required.");
    }
    const result = await findConsultationByAppointmentId(appointmentId);
    return res.status(200).json({
      success: true,
      message: "Consultation retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationsByPatientId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patient_id as string;
    if (!patientId) {
      throw new BadRequestError("Patient ID is required.");
    }
    const result = await findConsultationsByPatientId(patientId);
    return res.status(200).json({
      success: true,
      message: "Consultation history retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultationId = req.params.id as string;
    if (!consultationId) {
      throw new BadRequestError("Consultation ID is required.");
    }
    const result = await findConsultationById(consultationId);
    return res.status(200).json({
      success: true,
      message: "Consultation retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

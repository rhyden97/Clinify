import { z } from "zod";

export const ParamsIdSchema = z.object({
  id: z.uuid(),
});

export type ParamsIdType = z.infer<typeof ParamsIdSchema>;

export const ParamsAppointmentIdSchema = z.object({
  appointment_id: z.uuid(),
});

export type ParamsAppointmentIdType = z.infer<typeof ParamsAppointmentIdSchema>;

export const ParamsPatientIdSchema = z.object({
  patient_id: z.uuid(),
});

export type ParamsPatientIdType = z.infer<typeof ParamsPatientIdSchema>;

export const ParamsConsultationIdSchema = z.object({
  consultation_id: z.uuid(),
});

export type ParamsConsultationIdType = z.infer<typeof ParamsConsultationIdSchema>;

export const QueryDoctorDirectorySchema = z.object({
  specialty_id: z.uuid().optional(),
  search: z.string().optional(),
});

export type QueryDoctorDirectoryType = z.infer<typeof QueryDoctorDirectorySchema>;

export const AvailableSlotsQuerySchema = z.object({
  date: z.iso.date(),
});

export type AvailableSlotsQueryType = z.infer<typeof AvailableSlotsQuerySchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;
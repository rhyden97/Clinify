import { z } from "zod";
import { UserSchema } from "./users.schema.js";

export const PatientProfileSchema = z.object({
  id: z.uuid().trim(),
  user_id: z.uuid().trim(),
  document_id: z.string().trim().regex(/^[0-9]{7,30}$/).max(30).optional().nullable(),
  birth_day: z.iso.date(),
  gender: z.enum(["M", "F", "O"]),
  address: z.string().trim().min(5).max(255).optional().nullable(),
  emergency_contact_name: z.string().trim().min(5).max(255).optional().nullable(),
  emergency_contact_phone: z
    .string()
    .trim()
    .regex(/^[67]\d{7}$/)
    .optional()
    .nullable(),
});

export type PatientProfileType = z.infer<typeof PatientProfileSchema>;

export const PatientRegisterSchema = UserSchema.extend({
  document_id: z.string().trim().min(7).max(30).optional().nullable(),
  birth_date: z.coerce.date(),
  gender: z.enum(["M", "F", "O"]),
  address: z.string().trim().min(5).max(255).optional().nullable(),
  emergency_contact_name: z.string().trim().min(5).max(255).optional().nullable(),
  emergency_contact_phone: z
    .string()
    .trim()
    .regex(/^[67]\d{7}$/)
    .optional()
    .nullable(),
});

export type PatientRegisterType = z.infer<typeof PatientRegisterSchema>;

export const PatientUpdateSchema = z.object({
  address: z.string().trim().min(5).max(255).optional().nullable(),
  phone: z.string().trim().regex(/^[67]\d{7}$/).optional().nullable(),
  emergency_contact_name: z.string().trim().min(5).max(255).optional().nullable(),
  emergency_contact_phone: z
    .string()
    .trim()
    .regex(/^[67]\d{7}$/)
    .optional()
    .nullable(),
});

export type PatientUpdateType = z.infer<typeof PatientUpdateSchema>;

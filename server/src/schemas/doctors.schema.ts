import { z } from "zod";
import { UserSchema } from "./users.schema.js";

export const DoctorProfileSchema = z.object({
  id: z.uuid().trim(),
  user_id: z.uuid().trim().optional(),
  medical_license: z
    .string()
    .trim()
    .min(2, { message: "Medical license is very short" })
    .max(50, { message: "Medical license is very long" }),
  specialty_id: z.uuid().trim(),
});

export type DoctorProfileType = z.infer<typeof DoctorProfileSchema>;

export const DoctorRegistrationSchema = UserSchema.extend({
  role: z.literal("doctor"),
  medical_license: z
    .string()
    .trim()
    .min(2, { message: "Medical license is very short" })
    .max(50, { message: "Medical license is very long" }),
  specialty_id: z.uuid().trim(),
});

export type DoctorRegistrationType = z.infer<typeof DoctorRegistrationSchema>;

export const DoctorUpdateSchema = z.object({
  medical_license: z
    .string()
    .trim()
    .min(2, { message: "Medical license is very short" })
    .max(50, { message: "Medical license is very long" })
    .optional(),
  specialty_id: z.uuid().trim().optional(),
});

export type DoctorUpdateType = z.infer<typeof DoctorUpdateSchema>;

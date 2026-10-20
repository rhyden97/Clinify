import { z } from "zod"

export const MedicalRecordSchema = z.object({
  patient_id: z.uuid(),
  blood_type: z.enum(["O+","O-","A+","A-","B+","B-","AB+","AB-"]),
  chronic_diseases: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  surgical_history: z.string().optional().nullable(),
  family_history: z.string().optional().nullable(),
})

export type MedicalRecordType = z.infer<typeof MedicalRecordSchema>

export const UpsertMedicalRecordSchema = MedicalRecordSchema.omit({ patient_id: true });
export type UpsertMedicalRecordType = z.infer<typeof UpsertMedicalRecordSchema>;

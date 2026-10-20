import { z } from "zod";

export const ConsultationTreatmentItemSchema = z.object({
  medication_name: z.string().min(1).max(100),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  duration: z.string().max(100).optional().nullable(),
  instructions: z.string().optional().nullable(),
  start_date: z.iso.date().optional().nullable(),
  end_date: z.iso.date().optional().nullable(),
});

export const ConsultationSchema = z.object({
  appointment_id: z.uuid(),
  patient_id: z.uuid().optional(),
  doctor_id: z.uuid().optional(),
  consultation_date: z.iso.datetime({ offset: true }).optional(),
  symptoms: z.string().optional().nullable(),
  diagnosis: z.string().min(1, { message: "Diagnosis is required" }),
  physical_examination: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  treatments: z.array(ConsultationTreatmentItemSchema).optional(),
});

export type ConsultationType = z.infer<typeof ConsultationSchema>;
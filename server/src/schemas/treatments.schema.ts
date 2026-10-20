import { z } from "zod";

export const TreatmentSchema = z
  .object({
    consultation_id: z.uuid(),
    medication_name: z.string().min(1).max(100),
    dosage: z.string().min(1).max(100),
    frequency: z.string().min(1).max(100),
    duration: z.string().max(100).optional().nullable(),
    instructions: z.string().optional().nullable(),
    start_date: z.iso.date().optional().nullable(),
    end_date: z.iso.date().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.start_date <= data.end_date;
      }
      return true;
    },
    {
      message: "start_date must be earlier than or equal to end_date",
      path: ["end_date"],
    }
  );

export type TreatmentType = z.infer<typeof TreatmentSchema>;

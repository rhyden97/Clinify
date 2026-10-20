import { z } from "zod"

export const MedicalFileSchema = z.object({
  patient_id: z.uuid(),
  consultation_id: z.uuid().optional().nullable(),
  uploaded_by: z.uuid(),
  file_name: z.string().min(1).max(255),
  file_url: z.url().min(1).max(500),
  file_type: z.string().min(1).max(50),
  category: z.enum(["x_ray", "lab_result", "prescription", "other"]),
})

export type MedicalFileType = z.infer<typeof MedicalFileSchema>

export const UploadMedicalFileInputSchema = MedicalFileSchema.omit({ uploaded_by: true });
export type UploadMedicalFileInputType = z.infer<typeof UploadMedicalFileInputSchema>;

export const MedicalFilesQuerySchema = z.object({
  category: z.enum(["x_ray", "lab_result", "prescription", "other"]).optional(),
});
export type MedicalFilesQueryType = z.infer<typeof MedicalFilesQuerySchema>;
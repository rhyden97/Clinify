import { z } from "zod";

export const SpecialtySchema = z.object({
  name: z.string().trim().min(5, { message: "Name is very short" }).max(100, { message: "Name is very long" }),
  description: z.string().trim().min(10, { message: "Description is very short" }).max(255, { message: "Description is very long" }).optional().nullable(),
});

export type SpecialtyType = z.infer<typeof SpecialtySchema>;

export const SpecialtyUpdateSchema = SpecialtySchema.partial();
export type SpecialtyUpdateType = z.infer<typeof SpecialtyUpdateSchema>;
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email().trim().toLowerCase().max(100),
  password: z.string().trim().min(1, { message: "Password is very short" }), 
});

export type LoginType = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  success: z.boolean(),  
  user: z.object({
    names: z.string(),
    last_names: z.string(),
    role: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UpdateProfileSchema = z.object({
  names: z.string().min(1, { message: "Names are required" }),
  last_names: z.string().min(1, { message: "Last names are required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  current_password: z.string().min(1, { message: "Current password is required" }),
  new_password: z.string().min(8, { message: "New password must be at least 8 characters" }),
});

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;


export const JwtPayloadSchema = z.object({
  userId: z.uuid(),
  role: z.string(),
  specificId: z.string().optional()
});

export type JwtPayloadType = z.infer<typeof JwtPayloadSchema>;

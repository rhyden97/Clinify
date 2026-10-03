import { z } from "zod";

export const UserSchema = z.object({
  names: z.string().trim().min(2, { message: "Names is very short" }).max(255, { message: "Names is very long" }),
  last_names: z.string().trim().min(2, { message: "Last names is very short" }).max(255, { message: "Last names is very long" }),
  email: z.email().trim().toLowerCase().max(100, { message: "Email is very long" }),
  phone: z.string().trim().regex(/^[67]\d{7}$/).max(20, { message: "Phone is very long" }).optional().nullable(),
  password: z.string().trim().min(8, { message: "Password is very short" }).max(255, { message: "Password is very long" }),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const UserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"], {
    message: "Status must be 'active', 'inactive', or 'suspended'",
  }),
});

export const UserQuerySchema = z.object({
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type UserType = z.infer<typeof UserSchema>;
export type UserStatusType = z.infer<typeof UserStatusSchema>;
export type UserQueryType = z.infer<typeof UserQuerySchema>;
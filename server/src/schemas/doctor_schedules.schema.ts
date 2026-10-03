import { z } from "zod";

export const DoctorScheduleSchema = z
  .object({
    doctor_id: z.uuid().trim(),
    day_week: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
      message: "Formato de hora inválido. Usa formato 24h (HH:mm o HH:mm:ss)",
    }),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
      message: "Formato de hora inválido. Usa formato 24h (HH:mm o HH:mm:ss)",
    }),
    slot_duration_minutes: z.int().positive({ message: "Slot duration must be positive" }),
    is_active: z.boolean(),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be earlier than end_time",
    path: ["end_time"],
  });

export type DoctorScheduleType = z.infer<typeof DoctorScheduleSchema>;

export const DoctorScheduleItemSchema = z
  .object({
    day_week: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
      message: "Invalid time format. Use 24h format (HH:mm or HH:mm:ss)",
    }),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
      message: "Invalid time format. Use 24h format (HH:mm or HH:mm:ss)",
    }),
    slot_duration_minutes: z.int().positive().default(30),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be earlier than end_time",
    path: ["end_time"],
  });

export const SetDoctorScheduleSchema = z.union([
  DoctorScheduleItemSchema,
  z.array(DoctorScheduleItemSchema),
]);

export type SetDoctorScheduleType = z.infer<typeof SetDoctorScheduleSchema>;
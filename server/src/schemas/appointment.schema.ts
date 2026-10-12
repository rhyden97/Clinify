import { z } from "zod";

export const AppointmentSchema = z
  .object({
    patient_id: z.uuid().trim().optional(),
    doctor_id: z.uuid().trim(),
    appointment_date: z.iso.date(),
    start_time: z.iso.datetime({ offset: false }),
    end_time: z.iso.datetime({ offset: false }),
    status: z
      .enum([
        "scheduled",
        "completed",
        "cancelled_by_doctor",
        "cancelled_by_patient",
        "no_show",
      ])
      .default("scheduled"),
    reason_visit: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.start_time) < new Date(data.end_time),
    {
      message: "start_time must be earlier than end_time",
      path: ["end_time"],
    }
  );

export type AppointmentType = z.infer<typeof AppointmentSchema>;

export const AppointmentStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "completed",
    "cancelled_by_doctor",
    "cancelled_by_patient",
    "no_show",
  ]),
});

export type AppointmentStatusType = z.infer<typeof AppointmentStatusSchema>;


export const GetAppointmentsQuerySchema = z.object({
  status: z.enum([
    "scheduled",
    "completed",
    "cancelled_by_doctor",
    "cancelled_by_patient",
    "no_show",
  ]).optional(),
  doctor_id: z.uuid().optional(),
  date: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type GetAppointmentsQueryType = z.infer<typeof GetAppointmentsQuerySchema>


export const GetAppointmentByIdParamsSchema = z.object({
  id: z.uuid(),
});

export type GetAppointmentByIdParamsType = z.infer<typeof GetAppointmentByIdParamsSchema>


export const UpdateAppointmentSchema = z.object({
  appointment_date: z.coerce.date().optional(),
  start_time: z.coerce.date().optional(),
  end_time: z.coerce.date().optional(),
  status: z.enum([
    "scheduled",
    "completed",
    "cancelled_by_doctor",
    "cancelled_by_patient",
    "no_show",
  ]).optional(),
  reason_visit: z.string().optional(),
});

export type UpdateAppointmentType = z.infer<typeof UpdateAppointmentSchema>

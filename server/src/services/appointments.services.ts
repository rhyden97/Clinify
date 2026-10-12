import type { GetAppointmentsQueryType } from "../schemas/appointment.schema.js";
import type { JwtPayloadType } from "../schemas/auth.schema.js";
import type { AppointmentType, AppointmentStatusType } from "../schemas/appointment.schema.js";
import { NotFoundError } from "../utils/errors.js";
import { pool } from "../database/database.js";

interface GetAppointmentsParams {
  filters: GetAppointmentsQueryType;
  user: JwtPayloadType;
}

export const findAppointments = async ({
  filters,
  user,
}: GetAppointmentsParams) => {
  const { status, doctor_id, date, page } = filters;
  const currentPage = page && page > 0 ? page : 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const queryValues: any[] = [];
  const conditions: string[] = [];

  if (user.role === "patient") {
    const patientId = user.specificId;
    if (patientId) {
      queryValues.push(patientId);
      conditions.push(`appointments.patient_id = $${queryValues.length}`);
    }
  } else if (user.role === "doctor") {
    const doctorId = user.specificId;
    if (doctorId) {
      queryValues.push(doctorId);
      conditions.push(`appointments.doctor_id = $${queryValues.length}`);
    }
  }

  if (status) {
    queryValues.push(status);
    conditions.push(`appointments.status = $${queryValues.length}`);
  }

  if (doctor_id && user.role !== "doctor") {
    queryValues.push(doctor_id);
    conditions.push(`appointments.doctor_id = $${queryValues.length}`);
  }

  if (date) {
    const dateStr =
      date instanceof Date ? date.toISOString().split("T")[0] : date;
    queryValues.push(dateStr);
    conditions.push(`appointments.appointment_date = $${queryValues.length}`);
  }

  let whereClause = "";
  if (conditions.length > 0) {
    whereClause = "WHERE " + conditions.join(" AND ");
  }

  queryValues.push(limit);
  const limitPlaceholder = `$${queryValues.length}`;
  queryValues.push(offset);
  const offsetPlaceholder = `$${queryValues.length}`;

  const queryText = `
      SELECT
        appointments.id,
        appointments.appointment_date,
        appointments.start_time,
        appointments.end_time,
        appointments.status,
        appointments.reason_visit AS reason,
        patients.id AS patient_id,
        u_pat.names AS patient_names,
        u_pat.last_names AS patient_last_names,
        doctors.id AS doctor_id,
        u_doc.names AS doctor_names,
        u_doc.last_names AS doctor_last_names,
        COUNT(*) OVER() AS total_count
      FROM appointments
      JOIN patients ON appointments.patient_id = patients.id
      JOIN users u_pat ON patients.user_id = u_pat.id
      JOIN doctors ON appointments.doctor_id = doctors.id
      JOIN users u_doc ON doctors.user_id = u_doc.id
      ${whereClause}
      ORDER BY appointments.appointment_date DESC, appointments.start_time ASC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
    `;

  const result = await pool.query(queryText, queryValues);
  const totalCount =
    result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    page: currentPage,
    count: totalCount,
    appointments: result.rows.map((row) => {
      const { total_count, ...appointment } = row;
      return appointment;
    }),
  };
};

export const createAppointment = async (data: AppointmentType) => {
  const res = await pool.query(
    "INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, status, reason_visit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [
      data.patient_id,
      data.doctor_id,
      data.appointment_date,
      data.start_time,
      data.end_time,
      data.status || "scheduled",
      data.reason_visit || null,
    ],
  );

  return res.rows[0];
};

export const findAppointmentById = async (id: string) => {
  const res = await pool.query(
    `SELECT 
      a.id, a.patient_id, a.doctor_id, a.appointment_date, a.start_time, a.end_time, a.status, a.reason_visit,
      u_pat.names AS patient_names, u_pat.last_names AS patient_last_names,
      u_doc.names AS doctor_names, u_doc.last_names AS doctor_last_names
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     JOIN users u_pat ON p.user_id = u_pat.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users u_doc ON d.user_id = u_doc.id
     WHERE a.id = $1`,
    [id],
  );
  if (res.rows.length === 0) {
    throw new NotFoundError("Appointment not found");
  }

  return res.rows[0];
};

export const updateAppointmentStatus = async (id: string, status: AppointmentStatusType | string) => {
  const res = await pool.query(
    "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  if (res.rows.length === 0) {
    throw new NotFoundError("Appointment not found");
  }
  return res.rows[0];
};

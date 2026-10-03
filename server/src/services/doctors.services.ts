import bcrypt from "bcrypt";
import { pool } from "../database/database.js";
import { env } from "../config/env.config.js";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors.js";
import type { DoctorRegistrationType, DoctorUpdateType } from "../schemas/doctors.schema.js";

export const findDoctorDirectory = async (
  specialty_id?: string,
  search?: string,
) => {
  const queryValues: any[] = [];
  const conditions: string[] = ["u.status = 'active'"];

  if (specialty_id) {
    queryValues.push(specialty_id);
    conditions.push(`d.specialty_id = $${queryValues.length}`);
  }

  if (search) {
    queryValues.push(`%${search}%`);
    conditions.push(`(u.names ILIKE $${queryValues.length} OR u.last_names ILIKE $${queryValues.length} OR s.name ILIKE $${queryValues.length})`);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const query = `
    SELECT 
      d.id AS doctor_id,
      d.user_id,
      u.names,
      u.last_names,
      u.email,
      u.phone,
      d.medical_license,
      s.id AS specialty_id,
      s.name AS specialty_name,
      s.description AS specialty_description
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN specialties s ON d.specialty_id = s.id
    ${whereClause}
    ORDER BY u.last_names ASC, u.names ASC;
  `;

  const result = await pool.query(query, queryValues);
  return result.rows;
};

export const findDoctorById = async (doctorId: string) => {
  const query = `
    SELECT 
      d.id AS doctor_id,
      d.user_id,
      u.names,
      u.last_names,
      u.email,
      u.phone,
      u.status,
      d.medical_license,
      s.id AS specialty_id,
      s.name AS specialty_name,
      s.description AS specialty_description
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN specialties s ON d.specialty_id = s.id
    WHERE d.id = $1;
  `;
  const result = await pool.query(query, [doctorId]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Doctor not found");
  }
  return result.rows[0];
};

export const registerDoctor = async (doctorData: DoctorRegistrationType) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [doctorData.email]);
    if (existingUser.rows.length > 0) {
      throw new ConflictError("Email already in use");
    }

    const existingLicense = await client.query("SELECT id FROM doctors WHERE medical_license = $1", [doctorData.medical_license]);
    if (existingLicense.rows.length > 0) {
      throw new ConflictError("Medical license already registered");
    }

    const passwordHash = await bcrypt.hash(doctorData.password, env.SALT_ROUNDS);
    const userQuery = `
      INSERT INTO users (names, last_names, email, password_hash, phone, role, status)
      VALUES ($1, $2, $3, $4, $5, 'doctor', 'active')
      RETURNING id, names, last_names, email, phone, role, status;
    `;
    const userResult = await client.query(userQuery, [
      doctorData.names,
      doctorData.last_names,
      doctorData.email,
      passwordHash,
      doctorData.phone || null,
    ]);
    const user = userResult.rows[0];

    const doctorQuery = `
      INSERT INTO doctors (user_id, medical_license, specialty_id)
      VALUES ($1, $2, $3)
      RETURNING id, medical_license, specialty_id;
    `;
    const doctorResult = await client.query(doctorQuery, [
      user.id,
      doctorData.medical_license,
      doctorData.specialty_id,
    ]);
    const doctor = doctorResult.rows[0];

    await client.query("COMMIT");

    return {
      doctor_id: doctor.id,
      user_id: user.id,
      names: user.names,
      last_names: user.last_names,
      email: user.email,
      phone: user.phone,
      medical_license: doctor.medical_license,
      specialty_id: doctor.specialty_id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateDoctor = async (doctorId: string, updateData: DoctorUpdateType) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updateData.medical_license) {
    values.push(updateData.medical_license);
    fields.push(`medical_license = $${values.length}`);
  }

  if (updateData.specialty_id) {
    values.push(updateData.specialty_id);
    fields.push(`specialty_id = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new BadRequestError("No fields provided for update");
  }

  values.push(doctorId);
  const query = `
    UPDATE doctors 
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
    RETURNING id, user_id, medical_license, specialty_id;
  `;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new NotFoundError("Doctor not found");
  }
  return result.rows[0];
};

export const findDoctorSchedules = async (doctorId: string) => {
  const query = `
    SELECT id, doctor_id, day_week, start_time, end_time, slot_duration_minutes, is_active
    FROM doctor_schedules
    WHERE doctor_id = $1
    ORDER BY 
      CASE day_week
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
      END, start_time ASC;
  `;
  const result = await pool.query(query, [doctorId]);
  return result.rows;
};

export const setDoctorSchedules = async (doctorId: string, scheduleData: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const docCheck = await client.query("SELECT id FROM doctors WHERE id = $1", [doctorId]);
    if (docCheck.rows.length === 0) {
      throw new NotFoundError("Doctor not found");
    }

    const schedules = Array.isArray(scheduleData) ? scheduleData : [scheduleData];

    await client.query("DELETE FROM doctor_schedules WHERE doctor_id = $1", [doctorId]);

    const insertedSchedules = [];
    for (const item of schedules) {
      const insertQuery = `
        INSERT INTO doctor_schedules (doctor_id, day_week, start_time, end_time, slot_duration_minutes, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, doctor_id, day_week, start_time, end_time, slot_duration_minutes, is_active;
      `;
      const res = await client.query(insertQuery, [
        doctorId,
        item.day_week,
        item.start_time,
        item.end_time,
        item.slot_duration_minutes || 30,
        item.is_active ?? true,
      ]);
      insertedSchedules.push(res.rows[0]);
    }

    await client.query("COMMIT");
    return insertedSchedules;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findDoctorAvailableSlots = async (doctorId: string, dateStr: string) => {
  const dayQuery = `SELECT LOWER(TO_CHAR($1::date, 'FMDay')) AS day_name;`;
  const dayResult = await pool.query(dayQuery, [dateStr]);
  const dayOfWeek = dayResult.rows[0]?.day_name;

  if (!dayOfWeek) {
    throw new BadRequestError("Invalid date provided");
  }

  const scheduleQuery = `
    SELECT start_time, end_time, slot_duration_minutes
    FROM doctor_schedules
    WHERE doctor_id = $1 AND day_week = $2 AND is_active = true;
  `;
  const scheduleResult = await pool.query(scheduleQuery, [doctorId, dayOfWeek]);

  if (scheduleResult.rows.length === 0) {
    return [];
  }

  const { start_time, end_time, slot_duration_minutes } = scheduleResult.rows[0];

  const timeToMinutes = (timeStr: string) => {
    const parts = timeStr.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const startMinutes = timeToMinutes(start_time);
  const endMinutes = timeToMinutes(end_time);
  const duration = slot_duration_minutes || 30;

  const candidateSlots: { start: string; end: string }[] = [];
  for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
    candidateSlots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + duration),
    });
  }

  const appointmentsQuery = `
    SELECT 
      TO_CHAR(start_time AT TIME ZONE 'UTC', 'HH24:MI') AS booked_start,
      TO_CHAR(end_time AT TIME ZONE 'UTC', 'HH24:MI') AS booked_end
    FROM appointments
    WHERE doctor_id = $1 
      AND appointment_date = $2::date
      AND status NOT IN ('cancelled_by_doctor', 'cancelled_by_patient');
  `;
  const appResult = await pool.query(appointmentsQuery, [doctorId, dateStr]);
  const bookedSlots = appResult.rows;

  const availableSlots = candidateSlots
    .filter((slot) => {
      const isBooked = bookedSlots.some((booked) => {
        return slot.start === booked.booked_start;
      });
      return !isBooked;
    })
    .map((slot) => slot.start);

  return availableSlots;
};

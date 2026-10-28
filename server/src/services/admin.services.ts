import { pool } from "../database/database.js";

export const findAdminMetrics = async () => {
  const query = `
      SELECT
        (SELECT COUNT(*)::int FROM users) AS "totalUsers",
        (SELECT COUNT(*)::int FROM doctors) AS "totalDoctors",
        (SELECT COUNT(*)::int FROM patients) AS "totalPatients",
        (SELECT COUNT(*)::int FROM specialties) AS "totalSpecialties",
        (SELECT COUNT(*)::int FROM appointments WHERE DATE(appointment_date) = CURRENT_DATE) AS "totalAppointmentsToday",
        (SELECT COUNT(*)::int FROM appointments WHERE DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE)) AS "totalAppointmentsThisMonth",
        (SELECT COUNT(*)::int FROM consultations WHERE DATE(created_at) = CURRENT_DATE) AS "totalConsultationsToday",
        (SELECT COUNT(*)::int FROM treatments WHERE DATE(start_date) = CURRENT_DATE) AS "totalTreatmentsToday";
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

export const findDoctorMetrics = async (doctorId: string) => {
  const query = `
      SELECT
        (SELECT COUNT(*)::int FROM appointments WHERE doctor_id = $1 AND DATE(appointment_date) = CURRENT_DATE) AS "totalAppointmentsToday",
        (SELECT COUNT(*)::int FROM appointments WHERE doctor_id = $1 AND status = 'scheduled' AND DATE(appointment_date) >= CURRENT_DATE) AS "pendingAppointments",
        (SELECT COUNT(*)::int FROM consultations WHERE doctor_id = $1 AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS "attendedConsultationsThisMonth",
        (SELECT COUNT(*)::int FROM treatments t JOIN consultations c ON t.consultation_id = c.id WHERE c.doctor_id = $1 AND DATE(t.start_date) = CURRENT_DATE) AS "totalTreatmentsToday";
  `;

  const result = await pool.query(query, [doctorId]);
  return result.rows[0];
};
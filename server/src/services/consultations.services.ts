import type { ConsultationType } from "../schemas/consultations.schema.js";
import { pool } from "../database/database.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors.js";

export const createConsultation = async (consultationData: ConsultationType) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkAppointmentQuery = "SELECT * FROM appointments WHERE id = $1 FOR UPDATE";
    const appointmentResult = await client.query(checkAppointmentQuery, [consultationData.appointment_id]);
    const appointment = appointmentResult.rows[0];

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    if (consultationData.doctor_id && appointment.doctor_id !== consultationData.doctor_id) {
      throw new ForbiddenError("Doctor is not assigned to this appointment");
    }

    if (appointment.status === "completed") {
      throw new BadRequestError("Appointment has already been completed with a consultation");
    }

    const patientId = consultationData.patient_id || appointment.patient_id;
    const doctorId = consultationData.doctor_id || appointment.doctor_id;

    const insertConsultationQuery = `
      INSERT INTO consultations (
        appointment_id,
        patient_id,
        doctor_id,
        consultation_date,
        symptoms,
        diagnosis,
        physical_examination,
        notes
      ) VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP), $5, $6, $7, $8)
      RETURNING *;
    `;

    const consultationResult = await client.query(insertConsultationQuery, [
      consultationData.appointment_id,
      patientId,
      doctorId,
      consultationData.consultation_date || null,
      consultationData.symptoms || null,
      consultationData.diagnosis,
      consultationData.physical_examination || null,
      consultationData.notes || null,
    ]);

    const newConsultation = consultationResult.rows[0];

    const insertedTreatments = [];
    if (consultationData.treatments && consultationData.treatments.length > 0) {
      for (const item of consultationData.treatments) {
        const insertTreatmentQuery = `
          INSERT INTO treatments (
            consultation_id,
            medication_name,
            dosage,
            frequency,
            duration,
            instructions,
            start_date,
            end_date
          ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8)
          RETURNING *;
        `;
        const treatmentRes = await client.query(insertTreatmentQuery, [
          newConsultation.id,
          item.medication_name,
          item.dosage,
          item.frequency,
          item.duration || null,
          item.instructions || null,
          item.start_date || null,
          item.end_date || null,
        ]);
        insertedTreatments.push(treatmentRes.rows[0]);
      }
    }

    await client.query("UPDATE appointments SET status = 'completed' WHERE id = $1", [
      consultationData.appointment_id,
    ]);

    await client.query("COMMIT");

    return {
      ...newConsultation,
      treatments: insertedTreatments,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findConsultationByAppointmentId = async (appointmentId: string) => {
  const result = await pool.query(
    `SELECT 
      c.*,
      u_pat.names AS patient_names, u_pat.last_names AS patient_last_names,
      u_doc.names AS doctor_names, u_doc.last_names AS doctor_last_names
     FROM consultations c
     JOIN patients p ON c.patient_id = p.id
     JOIN users u_pat ON p.user_id = u_pat.id
     JOIN doctors d ON c.doctor_id = d.id
     JOIN users u_doc ON d.user_id = u_doc.id
     WHERE c.appointment_id = $1`,
    [appointmentId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Consultation not found for the given appointment ID");
  }

  const consultation = result.rows[0];
  const treatmentsRes = await pool.query("SELECT * FROM treatments WHERE consultation_id = $1", [consultation.id]);
  consultation.treatments = treatmentsRes.rows;

  return consultation;
};

export const findConsultationsByPatientId = async (patientId: string) => {
  const result = await pool.query(
    `SELECT 
      c.*,
      u_doc.names AS doctor_names, u_doc.last_names AS doctor_last_names,
      s.name AS specialty_name
     FROM consultations c
     JOIN doctors d ON c.doctor_id = d.id
     JOIN users u_doc ON d.user_id = u_doc.id
     JOIN specialties s ON d.specialty_id = s.id
     WHERE c.patient_id = $1
     ORDER BY c.consultation_date DESC;`,
    [patientId]
  );

  return result.rows;
};

export const findConsultationById = async (consultationId: string) => {
  const result = await pool.query(
    `SELECT 
      c.*,
      u_pat.names AS patient_names, u_pat.last_names AS patient_last_names,
      u_doc.names AS doctor_names, u_doc.last_names AS doctor_last_names,
      s.name AS specialty_name
     FROM consultations c
     JOIN patients p ON c.patient_id = p.id
     JOIN users u_pat ON p.user_id = u_pat.id
     JOIN doctors d ON c.doctor_id = d.id
     JOIN users u_doc ON d.user_id = u_doc.id
     JOIN specialties s ON d.specialty_id = s.id
     WHERE c.id = $1;`,
    [consultationId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Consultation not found for the given ID");
  }

  const consultation = result.rows[0];
  const treatmentsResult = await pool.query("SELECT * FROM treatments WHERE consultation_id = $1", [consultationId]);
  consultation.treatments = treatmentsResult.rows;

  return consultation;
};
import { pool } from "../database/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { TreatmentType } from "../schemas/treatments.schema.js";

export const findTreatmentsByConsultationId = async (consultationId: string) => {
  const checkConsultation = await pool.query(
    "SELECT id FROM consultations WHERE id = $1",
    [consultationId]
  );
  if (checkConsultation.rows.length === 0) {
    throw new NotFoundError("Consultation not found");
  }

  const result = await pool.query(
    "SELECT * FROM treatments WHERE consultation_id = $1 ORDER BY start_date ASC, id ASC",
    [consultationId]
  );
  return result.rows;
};

export const createTreatment = async (data: TreatmentType) => {
  const checkConsultation = await pool.query(
    "SELECT id FROM consultations WHERE id = $1",
    [data.consultation_id]
  );
  if (checkConsultation.rows.length === 0) {
    throw new NotFoundError("Consultation not found");
  }

  const query = `
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

  const values = [
    data.consultation_id,
    data.medication_name,
    data.dosage,
    data.frequency,
    data.duration || null,
    data.instructions || null,
    data.start_date || null,
    data.end_date || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteTreatment = async (treatmentId: string) => {
  const result = await pool.query(
    "DELETE FROM treatments WHERE id = $1 RETURNING id",
    [treatmentId]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("Treatment not found");
  }
  return { message: "Treatment deleted successfully" };
};

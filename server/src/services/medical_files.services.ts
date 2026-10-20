import { pool } from "../database/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { UploadMedicalFileInputType } from "../schemas/medical_files.schema.js";

export const createMedicalFile = async (
  userId: string,
  data: UploadMedicalFileInputType
) => {
  const patientCheck = await pool.query("SELECT id FROM patients WHERE id = $1", [data.patient_id]);
  if (patientCheck.rows.length === 0) {
    throw new NotFoundError("Patient not found");
  }

  if (data.consultation_id) {
    const consultationCheck = await pool.query("SELECT id FROM consultations WHERE id = $1", [
      data.consultation_id,
    ]);
    if (consultationCheck.rows.length === 0) {
      throw new NotFoundError("Consultation not found");
    }
  }

  const query = `
    INSERT INTO medical_files (
      patient_id,
      consultation_id,
      uploaded_by,
      file_name,
      file_url,
      file_type,
      category
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    data.patient_id,
    data.consultation_id || null,
    userId,
    data.file_name,
    data.file_url,
    data.file_type,
    data.category,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findMedicalFilesByPatient = async (
  patientId: string,
  category?: string
) => {
  const queryValues: any[] = [patientId];
  let categoryFilter = "";

  if (category) {
    queryValues.push(category);
    categoryFilter = `AND mf.category = $${queryValues.length}`;
  }

  const query = `
    SELECT 
      mf.*,
      u.names AS uploaded_by_names,
      u.last_names AS uploaded_by_last_names,
      u.role AS uploaded_by_role
    FROM medical_files mf
    JOIN users u ON mf.uploaded_by = u.id
    WHERE mf.patient_id = $1 ${categoryFilter}
    ORDER BY mf.created_at DESC;
  `;

  const result = await pool.query(query, queryValues);
  return result.rows;
};

export const deleteMedicalFile = async (fileId: string) => {
  const result = await pool.query("DELETE FROM medical_files WHERE id = $1 RETURNING id", [
    fileId,
  ]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Medical file not found");
  }
  return { message: "Medical file deleted successfully" };
};

import { pool } from "../database/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { PatientUpdateType } from "../schemas/patients.schema.js";
import type { UpsertMedicalRecordType } from "../schemas/medical_records.schema.js";
import type { PaginationQueryType } from "../schemas/request.schema.js";

export const findAllPatients = async (query: PaginationQueryType) => {
  const { search, page = 1, limit = 10 } = query;
  const currentPage = page > 0 ? page : 1;
  const currentLimit = limit > 0 && limit <= 100 ? limit : 10;
  const offset = (currentPage - 1) * currentLimit;

  const queryValues: any[] = [];
  const conditions: string[] = [];

  if (search) {
    queryValues.push(`%${search}%`);
    conditions.push(`(u.names ILIKE $${queryValues.length} OR u.last_names ILIKE $${queryValues.length} OR p.document_id ILIKE $${queryValues.length} OR u.email ILIKE $${queryValues.length})`);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  queryValues.push(currentLimit);
  const limitPlaceholder = `$${queryValues.length}`;
  queryValues.push(offset);
  const offsetPlaceholder = `$${queryValues.length}`;

  const queryText = `
    SELECT 
      p.id AS patient_id,
      p.user_id,
      u.names,
      u.last_names,
      u.email,
      u.phone,
      p.document_id,
      p.birth_day,
      p.gender,
      p.address,
      p.emergency_contact_name,
      p.emergency_contact_phone,
      p.created_at,
      COUNT(*) OVER() AS total_count
    FROM patients p
    JOIN users u ON p.user_id = u.id
    ${whereClause}
    ORDER BY u.last_names ASC, u.names ASC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
  `;

  const result = await pool.query(queryText, queryValues);
  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    patients: result.rows.map((row) => {
      const { total_count, ...patient } = row;
      return patient;
    }),
    total,
    page: currentPage,
    limit: currentLimit,
  };
};

export const findPatientById = async (patientId: string) => {
  const query = `
    SELECT 
      p.id AS patient_id,
      p.user_id,
      u.names,
      u.last_names,
      u.email,
      u.phone,
      p.document_id,
      p.birth_day,
      p.gender,
      p.address,
      p.emergency_contact_name,
      p.emergency_contact_phone,
      p.created_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1;
  `;
  const result = await pool.query(query, [patientId]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Patient not found");
  }
  return result.rows[0];
};

export const updatePatient = async (patientId: string, data: PatientUpdateType) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const patientCheck = await client.query("SELECT id, user_id FROM patients WHERE id = $1", [patientId]);
    if (patientCheck.rows.length === 0) {
      throw new NotFoundError("Patient not found");
    }
    const userId = patientCheck.rows[0].user_id;

    if (data.phone) {
      await client.query("UPDATE users SET phone = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        data.phone,
        userId,
      ]);
    }

    const patientFields: string[] = [];
    const patientValues: any[] = [];

    if (data.address !== undefined) {
      patientValues.push(data.address);
      patientFields.push(`address = $${patientValues.length}`);
    }
    if (data.emergency_contact_name !== undefined) {
      patientValues.push(data.emergency_contact_name);
      patientFields.push(`emergency_contact_name = $${patientValues.length}`);
    }
    if (data.emergency_contact_phone !== undefined) {
      patientValues.push(data.emergency_contact_phone);
      patientFields.push(`emergency_contact_phone = $${patientValues.length}`);
    }

    if (patientFields.length > 0) {
      patientValues.push(patientId);
      await client.query(
        `UPDATE patients SET ${patientFields.join(", ")} WHERE id = $${patientValues.length}`,
        patientValues
      );
    }

    await client.query("COMMIT");

    return await findPatientById(patientId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findMedicalRecordByPatientId = async (patientId: string) => {
  const result = await pool.query(
    "SELECT * FROM medical_records WHERE patient_id = $1",
    [patientId]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
};

export const upsertMedicalRecord = async (
  patientId: string,
  data: UpsertMedicalRecordType
) => {
  const patientCheck = await pool.query("SELECT id FROM patients WHERE id = $1", [patientId]);
  if (patientCheck.rows.length === 0) {
    throw new NotFoundError("Patient not found");
  }

  const query = `
    INSERT INTO medical_records (
      patient_id,
      blood_type,
      chronic_diseases,
      allergies,
      surgical_history,
      family_history,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (patient_id) DO UPDATE SET
      blood_type = EXCLUDED.blood_type,
      chronic_diseases = EXCLUDED.chronic_diseases,
      allergies = EXCLUDED.allergies,
      surgical_history = EXCLUDED.surgical_history,
      family_history = EXCLUDED.family_history,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    patientId,
    data.blood_type,
    data.chronic_diseases || null,
    data.allergies || null,
    data.surgical_history || null,
    data.family_history || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

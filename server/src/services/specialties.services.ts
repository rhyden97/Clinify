import { pool } from "../database/database.js";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.js";
import type { SpecialtyType, SpecialtyUpdateType } from "../schemas/specialties.schema.js";

export const findAllSpecialties = async () => {
  const result = await pool.query(
    "SELECT id, name, description FROM specialties ORDER BY name ASC"
  );
  return result.rows;
};

export const findSpecialtyById = async (id: string) => {
  const result = await pool.query(
    "SELECT id, name, description FROM specialties WHERE id = $1",
    [id]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("Specialty not found");
  }
  return result.rows[0];
};

export const createSpecialty = async (data: SpecialtyType) => {
  const existing = await pool.query("SELECT id FROM specialties WHERE name = $1", [data.name]);
  if (existing.rows.length > 0) {
    throw new ConflictError("Specialty with this name already exists");
  }

  const result = await pool.query(
    "INSERT INTO specialties (name, description) VALUES ($1, $2) RETURNING id, name, description",
    [data.name, data.description || null]
  );
  return result.rows[0];
};

export const updateSpecialty = async (id: string, data: SpecialtyUpdateType) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name) {
    values.push(data.name);
    fields.push(`name = $${values.length}`);
  }
  if (data.description !== undefined) {
    values.push(data.description);
    fields.push(`description = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new BadRequestError("No fields provided to update");
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE specialties SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, name, description`,
    values
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Specialty not found");
  }
  return result.rows[0];
};

export const deleteSpecialty = async (id: string) => {
  const docCheck = await pool.query(
    "SELECT COUNT(*)::int AS count FROM doctors WHERE specialty_id = $1",
    [id]
  );
  const count = docCheck.rows[0]?.count || 0;
  if (count > 0) {
    throw new ConflictError(
      `Cannot delete specialty because ${count} doctor(s) are assigned to it.`
    );
  }

  const result = await pool.query("DELETE FROM specialties WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Specialty not found");
  }
  return { message: "Specialty deleted successfully" };
};

import { pool } from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UnauthorizedError, BadRequestError } from "../utils/errors.js";
import { env } from "../config/env.config.js";
import type { LoginType } from "../schemas/auth.schema.js";
import type { PatientRegisterType } from "../schemas/patients.schema.js";

export const authenticateUser = async (userData: LoginType) => {
  const res = await pool.query(
    "SELECT u.id, u.names, u.last_names, u.password_hash, u.role, p.id as patient_id, d.id as doctor_id FROM users u LEFT JOIN patients p ON u.id = p.user_id LEFT JOIN doctors d ON u.id = d.user_id WHERE u.email = $1",
    [userData.email],
  );
  const user = res.rows[0];
  let specificId: string | null = null;
  if (user?.role === "patient") {
    specificId = user.patient_id;
  } else if (user?.role === "doctor") {
    specificId = user.doctor_id;
  }
  if (!user) throw new UnauthorizedError("Invalid credentials");
  const storedPasswordHash = user.password_hash;
  const isMatch = await bcrypt.compare(userData.password, storedPasswordHash);

  if (!isMatch) throw new UnauthorizedError("Invalid credentials");
  const token = jwt.sign(
    { id: user.id, role: user.role, specificId: specificId },
    env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  return {
    token,
    user: {
      names: user.names,
      last_names: user.last_names,
      role: user.role,
    },
  };
};

export const registerPatientUser = async (userData: PatientRegisterType) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userQuery = `INSERT INTO users (names, last_names, email, password_hash, phone, role) VALUES($1, $2, $3, $4, $5, 'patient') RETURNING id`;
    const userValues = [
      userData.names,
      userData.last_names,
      userData.email,
      await bcrypt.hash(userData.password, env.SALT_ROUNDS),
      userData.phone || null,
    ];
    const userResult = await client.query(userQuery, userValues);
    const userId = userResult.rows[0].id;

    const patientQuery = `INSERT INTO patients (user_id, document_id, birth_day, gender, address, emergency_contact_name, emergency_contact_phone) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    const patientValues = [
      userId,
      userData.document_id || null,
      userData.birth_date,
      userData.gender,
      userData.address || null,
      userData.emergency_contact_name || null,
      userData.emergency_contact_phone || null,
    ];
    const patientResult = await client.query(patientQuery, patientValues);
    const patientId = patientResult.rows[0].id;
    await client.query("COMMIT");

    const token = jwt.sign(
      { user_id: userId, role: userData.role, specificId: patientId },
      env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    return {
      token,
      user: {
        names: userData.names,
        last_names: userData.last_names,
        role: userData.role,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new BadRequestError(
      "Failed to register patient: " + (error as Error).message,
    );
  } finally {
    client.release();
  }
};

export const findUserProfileById = async (userId?: string, _role?: string) => {
  const res = await pool.query("SELECT id, names, last_names, phone, role FROM users WHERE id = $1", [userId]);
  const userData = res.rows[0];
  return userData;
};
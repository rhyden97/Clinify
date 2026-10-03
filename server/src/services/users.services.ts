import { pool } from "../database/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { UserQueryType } from "../schemas/users.schema.js";

export const findAllUsers = async (query: UserQueryType) => {
  const { role, status, search, page = 1, limit = 10 } = query;
  const currentPage = page > 0 ? page : 1;
  const currentLimit = limit > 0 && limit <= 100 ? limit : 10;
  const offset = (currentPage - 1) * currentLimit;

  const queryValues: any[] = [];
  const conditions: string[] = [];

  if (role) {
    queryValues.push(role);
    conditions.push(`role = $${queryValues.length}`);
  }

  if (status) {
    queryValues.push(status);
    conditions.push(`status = $${queryValues.length}`);
  }

  if (search) {
    queryValues.push(`%${search}%`);
    conditions.push(`(names ILIKE $${queryValues.length} OR last_names ILIKE $${queryValues.length} OR email ILIKE $${queryValues.length})`);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  queryValues.push(currentLimit);
  const limitPlaceholder = `$${queryValues.length}`;
  queryValues.push(offset);
  const offsetPlaceholder = `$${queryValues.length}`;

  const queryText = `
    SELECT 
      id, names, last_names, email, phone, role, status, created_at, updated_at,
      COUNT(*) OVER() AS total_count
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
  `;

  const result = await pool.query(queryText, queryValues);
  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    users: result.rows.map((row) => {
      const { total_count, ...user } = row;
      return user;
    }),
    total,
    page: currentPage,
    limit: currentLimit,
  };
};

export const findUserById = async (id: string) => {
  const result = await pool.query(
    "SELECT id, names, last_names, email, phone, role, status, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("User not found");
  }
  return result.rows[0];
};

export const updateUserStatus = async (id: string, status: string) => {
  const result = await pool.query(
    `UPDATE users 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING id, names, last_names, email, role, status, updated_at`,
    [status, id]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("User not found");
  }
  return result.rows[0];
};

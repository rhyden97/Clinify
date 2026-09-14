import { Pool } from "pg";
import { env } from "../config/env.config.js";
export const pool: Pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

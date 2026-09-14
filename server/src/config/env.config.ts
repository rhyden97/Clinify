import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  SERVER_PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  SALT_ROUNDS: z.coerce.number().default(10),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.url(),
});

export const env = envSchema.parse(process.env);
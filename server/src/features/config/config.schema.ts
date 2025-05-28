import z from "zod";

export const configurationSchema = z.object({
  PORT: z.number().min(1).max(65535),
  NODE_ENV: z.enum(["development", "production", "test"]),
  SMTP_MAIL: z.string().email(),
  SMTP_SECRET: z.string(),
  SMTP_PORT: z.number().min(1).max(65535),
  SMTP_HOST: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_RESET_EXPIRES_IN: z.string(),
  CLIENT_URL: z.string(),
  PUBLIC_PATH: z.string(),
  HOST_URL: z.string(),
  DB_PATH: z.string(),
});

export type ConfigData = z.infer<typeof configurationSchema>;

export type ConfigKeys = keyof ConfigData;

import "reflect-metadata";
import z from "zod";

import { injectable } from "tsyringe";
import { config } from "dotenv";
import { configurationSchema } from "./config.schema.js";
import type { ConfigData, ConfigKeys } from "./config.schema.js";
config();

@injectable()
export class AppConfig {
  private _configuration: ConfigData;
  constructor() {
    this._configuration = configurationSchema.parse({
      PORT: Number(process.env.PORT),
      NODE_ENV: process.env.NODE_ENV,
      SMTP_MAIL: process.env.SMTP_MAIL,
      SMTP_SECRET: process.env.SMTP_SECRET,
      SMTP_PORT: Number(process.env.SMTP_PORT),
      SMTP_HOST: process.env.SMTP_HOST,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN,
      CLIENT_URL: process.env.CLIENT_URL,
      PUBLIC_PATH: process.env.PUBLIC_PATH,
      HOST_URL: process.env.HOST_URL,
      DB_PATH: process.env.DB_PATH,
    });
  }

  getConfig(): ConfigData {
    return this._configuration;
  }

  getValue(string: ConfigKeys): string | number {
    return this._configuration[string];
  }
}

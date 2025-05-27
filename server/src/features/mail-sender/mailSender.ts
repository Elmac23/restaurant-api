import "reflect-metadata";

import nodemailer from "nodemailer";
import { injectable } from "tsyringe";
import { AppConfig } from "../config/appConfig.js";

@injectable()
export class MailSender {
  private _transporter: nodemailer.Transporter;
  constructor(private _config: AppConfig) {
    this._transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this._config.getValue("SMTP_MAIL") as string,
        pass: this._config.getValue("SMTP_SECRET") as string,
      },
    });
  }

  sendMail = (params: MailParams) => {
    const options = {
      from: this._config.getValue("SMTP_MAIL") as string,
      to: params.to,
      subject: params.subject,
      text: params.text,
    };
    this._transporter.sendMail(options, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  };
}

export type MailParams = {
  to: string;
  subject: string;
  text: string;
};

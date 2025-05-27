import multer, { FileFilterCallback, Multer } from "multer";
import { AppConfig } from "../features/config/appConfig.js";
import { Request } from "express";
import path from "path";
import { injectable } from "tsyringe";

@injectable()
export class FileUpload {
  public upload: Multer;
  constructor(private _config: AppConfig) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const path =
          (this._config.getValue("PUBLIC_PATH") as string) + "/images/";
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
        );
      },
    });

    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"));
      }
    };
    this.upload = multer({ storage, fileFilter });
  }
}

// declare global {
//   namespace Express {
//     interface Request {
//       file?: Express.Multer.File;
//     }
//   }
// }

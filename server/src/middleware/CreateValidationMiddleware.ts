import { Request, Response, NextFunction } from "express";
import z from "zod";
import { BadRequestError } from "../lib/errors/BadRequestError.js";

export class CreateValidationMiddleware<T> {
  constructor(private _schema: z.ZodSchema<T>) {}

  getMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = req.body;
        const parsedData = await this._schema.parseAsync(data);
        req.body = parsedData;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new BadRequestError(JSON.stringify(error.errors));
        } else throw Error("Unexpected behaviour");
      }
    };
  }
}

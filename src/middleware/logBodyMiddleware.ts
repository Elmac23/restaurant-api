import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export async function logBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.body);
  next();
}

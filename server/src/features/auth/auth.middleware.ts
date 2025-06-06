import "reflect-metadata";

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/appConfig.js";
import { ForbiddenError } from "../../lib/errors/ForbiddenError.js";
import { injectable } from "tsyringe";

@injectable()
export class Authentication {
  constructor(private _config: AppConfig) {}
  authenticationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      next();
      return;
    }
    const secret = this._config.getValue("JWT_SECRET") as string;
    const result = jwt.verify(token, secret) as UserPayload;
    if (!result) {
      throw new ForbiddenError(`Invalid token`);
    }
    req.user = result;
    next();
  };

  loggedInGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError("You are not logged in");
    }
    next();
  };

  roleGuard = (role: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (ROLES.indexOf(req.user?.role ?? "klient") < ROLES.indexOf(role)) {
        throw new ForbiddenError(`You are not ${role}`);
      }
      next();
    };
  };

  isSelfOrAdminGuard = (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id !== req.user?.id && req.user?.role !== "admin") {
      throw new ForbiddenError("You are not authorized to do this action");
    }
    next();
  };
}

export type Role = "klient" | "worker" | "manager" | "admin";
const ROLES = ["klient", "worker", "manager", "admin"] as const;

export type UserPayload = {
  id: string;
  restaurantId?: string;
  email: string;
  firstname?: string;
  role: Role;
  lastname?: string;
  city: string;
  address: string;
  phoneNumber: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

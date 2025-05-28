import "reflect-metadata";

import { BaseController } from "../../lib/base.controller.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { createUserSchema, registerUserSchema } from "../user/user.schema.js";
import { loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ForbiddenError } from "../../lib/errors/ForbiddenError.js";

@injectable()
export class AuthController extends BaseController {
  private _authService: AuthService;

  constructor(authService: AuthService) {
    super();
    this._authService = authService;

    const validateRegisterMiddleware = new CreateValidationMiddleware(
      registerUserSchema
    ).getMiddleware();

    const validateLoginMiddleware = new CreateValidationMiddleware(
      loginSchema
    ).getMiddleware();

    this._router.post("/login", validateLoginMiddleware, this.login);
    this._router.post("/register", validateRegisterMiddleware, this.register);
    this._router.post("/request-change-password", this.requestChangePassword);
    this._router.post("/reset-password", this.changePassword);
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const token = await this._authService.login(email, password);
    res.status(200).json({ access_token: token });
  };

  register = async (req: Request, res: Response) => {
    const userData = req.body;
    const token = await this._authService.register(userData);
    res.status(200).json({ access_token: token });
  };

  requestChangePassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this._authService.requestChangePassword(email);
    res.status(201).json({});
  };

  changePassword = async (
    req: Request<any, any, { password: string }, { token: string }>,
    res: Response
  ) => {
    const { token } = req.query;
    const { password } = req.body;
    await this._authService.changePassword(token, password);
    res.status(201).json({});
  };
}

import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { injectable } from "tsyringe";
import {
  CreateUser,
  createUserSchema,
  UpdateUser,
  updateUserSchema,
} from "./user.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";

@injectable()
export class UserController extends BaseController {
  constructor(
    private _userService: UserService,
    private _authentication: Authentication
  ) {
    super();

    const createUserValidationMiddleware = new CreateValidationMiddleware(
      createUserSchema
    ).getMiddleware();

    const updateUserValidationMiddleware = new CreateValidationMiddleware(
      updateUserSchema
    ).getMiddleware();

    const adminGuard = this._authentication.roleGuard("admin");

    this._router.get("/", this.getUsers);
    this._router.post(
      "/",
      adminGuard,
      createUserValidationMiddleware,
      this.createUser
    );
    this._router.patch(
      "/:id",
      this._authentication.isSelfOrAdminGuard,
      updateUserValidationMiddleware,
      this.updateUser
    );

    this._router.get("/:id", this.getUserById);

    this._router.delete(
      "/:id",
      this._authentication.isSelfOrAdminGuard,
      this.removeUserById
    );
  }

  getUsers = async (req: Request, res: Response) => {
    const { email, firstname, lastname, role, city } = req.query;
    let users = await this._userService.getUsers(req.query);
    if (email) {
      users = users.filter((u: any) =>
        u.email.toLowerCase().includes((email as string).toLowerCase())
      );
    }
    if (firstname) {
      users = users.filter((u: any) =>
        u.firstname.toLowerCase().includes((firstname as string).toLowerCase())
      );
    }
    if (lastname) {
      users = users.filter((u: any) =>
        u.lastname.toLowerCase().includes((lastname as string).toLowerCase())
      );
    }
    if (role) {
      users = users.filter((u: any) => u.role === role);
    }
    if (city) {
      users = users.filter((u: any) =>
        u.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }
    res.status(200).json(users);
  };

  getUserById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._userService.getUser(id);
    if (!result) throw new NotFoundError(`User with id ${id} not found`);
    res.status(200).json(result);
  };

  removeUserById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    await this._userService.deleteUser(id);
    res.status(200).json({});
  };

  createUser = async (req: Request<any, any, CreateUser>, res: Response) => {
    const user = req.body;

    const result = await this._userService.createUser(user);
    res.status(200).json(result);
  };

  updateUser = async (
    req: Request<{ id: string }, any, UpdateUser>,
    res: Response
  ) => {
    const id = req.params.id;
    const user = req.body;
    if (req.user?.role !== "admin") delete user.role;
    const result = await this._userService.updateUser(id, user);
    res.status(200).json(result);
  };
}

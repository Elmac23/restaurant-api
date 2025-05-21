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

@injectable()
export class UserController extends BaseController {
  private _userService: UserService;
  constructor(userService: UserService) {
    super();
    this._userService = userService;

    const createUserValidationMiddleware = new CreateValidationMiddleware(
      createUserSchema
    ).getMiddleware();

    const updateUserValidationMiddleware = new CreateValidationMiddleware(
      updateUserSchema
    ).getMiddleware();

    this._router.get("/", this.getUsers);
    this._router.post("/", createUserValidationMiddleware, this.createUser);
    this._router.patch("/:id", updateUserValidationMiddleware, this.updateUser);

    this._router.get("/:id", this.getUserById);

    this._router.delete("/:id", this.removeUserById);
  }

  getUsers = async (req: Request, res: Response) => {
    const users = await this._userService.getUsers();
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
    const result = await this._userService.updateUser(id, user);
    res.status(200).json(result);
  };
}

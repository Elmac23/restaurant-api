import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { DishService } from "./dish.service.js";
import { injectable } from "tsyringe";
import {
  CreateDish,
  createDishSchema,
  UpdateDish,
  updateDishSchema,
} from "./dish.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";

@injectable()
export class DishController extends BaseController {
  constructor(
    private _dishService: DishService,
    private _authentication: Authentication
  ) {
    super();

    const createDishValidationMiddleware = new CreateValidationMiddleware(
      createDishSchema
    ).getMiddleware();

    const updateDishValidationMiddleware = new CreateValidationMiddleware(
      updateDishSchema
    ).getMiddleware();

    const adminGuard = this._authentication.roleGuard("admin");

    this._router.get("/", this.getDishes);
    this._router.get("/:id", this.getDishById);
    this._router.post(
      "/",
      adminGuard,
      createDishValidationMiddleware,
      this.createDish
    );
    this._router.patch(
      "/:id",
      adminGuard,
      updateDishValidationMiddleware,
      this.updateDish
    );

    this._router.delete("/:id", adminGuard, this.removeDishById);
  }

  getDishes = async (req: Request, res: Response) => {
    const restaurats = await this._dishService.getDishes();
    res.status(200).json(restaurats);
  };

  getDishById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._dishService.getDish(id);
    if (!result) throw new NotFoundError(`Dish with id ${id} not found`);
    res.status(200).json(result);
  };

  removeDishById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    await this._dishService.deleteDish(id);
    res.status(200).json({});
  };

  createDish = async (req: Request<any, any, CreateDish>, res: Response) => {
    console.log(req.body);
    const restaurant = req.body;
    const result = await this._dishService.createDish(restaurant);
    res.status(200).json(result);
  };

  updateDish = async (
    req: Request<{ id: string }, any, UpdateDish>,
    res: Response
  ) => {
    const id = req.params.id;
    const restaurant = req.body;
    const result = await this._dishService.updateDish(id, restaurant);
    res.status(200).json(result);
  };
}

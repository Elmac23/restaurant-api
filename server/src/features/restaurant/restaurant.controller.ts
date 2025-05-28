import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { RestaurantService } from "./restaurant.service.js";
import { injectable } from "tsyringe";
import {
  CreateRestaurant,
  createRestaurantSchema,
  UpdateRestaurant,
  updateRestaurantSchema,
} from "./restaurant.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";

@injectable()
export class RestaurantController extends BaseController {
  constructor(
    private _restaurantService: RestaurantService,
    _authentication: Authentication
  ) {
    super();

    const createRestaurantValidationMiddleware = new CreateValidationMiddleware(
      createRestaurantSchema
    ).getMiddleware();

    const updateRestaurantValidationMiddleware = new CreateValidationMiddleware(
      updateRestaurantSchema
    ).getMiddleware();

    const adminGuard = _authentication.roleGuard("admin");

    this._router.get("/", this.getRestaurants);
    this._router.post(
      "/",
      adminGuard,
      createRestaurantValidationMiddleware,
      this.createRestaurant
    );
    this._router.patch(
      "/:id",
      adminGuard,
      updateRestaurantValidationMiddleware,
      this.updateRestaurant
    );

    this._router.get("/:id", this.getRestaurantById);

    this._router.delete("/:id", adminGuard, this.removeRestaurantById);
  }

  getRestaurants = async (req: Request, res: Response) => {
    const restaurats = await this._restaurantService.getRestaurants();
    res.status(200).json(restaurats);
  };

  getRestaurantById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._restaurantService.getRestaurant(id);
    if (!result) throw new NotFoundError(`Restaurant with id ${id} not found`);
    res.status(200).json(result);
  };

  removeRestaurantById = async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    const id = req.params.id;
    await this._restaurantService.deleteRestaurant(id);
    res.status(200).json({});
  };

  createRestaurant = async (
    req: Request<any, any, CreateRestaurant>,
    res: Response
  ) => {
    const restaurant = req.body;
    const result = await this._restaurantService.createRestaurant(restaurant);
    res.status(200).json(result);
  };

  updateRestaurant = async (
    req: Request<{ id: string }, any, UpdateRestaurant>,
    res: Response
  ) => {
    const id = req.params.id;
    const restaurant = req.body;
    const result = await this._restaurantService.updateRestaurant(
      id,
      restaurant
    );
    res.status(200).json(result);
  };
}

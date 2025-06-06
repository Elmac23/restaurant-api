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
import { FileUpload } from "../../file-upload/fileUpload.js";
import { AppConfig } from "../config/appConfig.js";

@injectable()
export class DishController extends BaseController {
  constructor(
    private _dishService: DishService,
    private _authentication: Authentication,
    private _config: AppConfig,
    private _fileUpload: FileUpload
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
      this._fileUpload.upload.single("image"),
      createDishValidationMiddleware,
      this.createDish
    );
    this._router.patch(
      "/:id",
      adminGuard,
      this._fileUpload.upload.single("image"),
      updateDishValidationMiddleware,
      this.updateDish
    );

    this._router.delete("/:id", adminGuard, this.removeDishById);
  }

  getDishes = async (req: Request, res: Response) => {
    const { name, category, categoryId, available } = req.query;
    let dishes = await this._dishService.getDishes(req.query);
    if (name) {
      dishes = dishes.filter((d: any) =>
        d.name.toLowerCase().includes((name as string).toLowerCase())
      );
    }
    if (category || categoryId) {
      const filterCategoryId = categoryId || category;
      dishes = dishes.filter((d: any) => d.categoryId === filterCategoryId);
    }
    if (available !== undefined) {
      dishes = dishes.filter(
        (d: any) => String(d.available) === String(available)
      );
    }
    res.status(200).json(dishes);
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
    const file = req.file;
    const path = file 
      ? `${this._config.getValue("HOST_URL")}/public/images/${file.filename}`
      : `${this._config.getValue("HOST_URL")}/public/images/default_pizza.png`;
    const dish = req.body;
    const result = await this._dishService.createDish({
      ...dish,
      filePath: path,
    });
    res.status(200).json(result);
  };

  updateDish = async (
    req: Request<{ id: string }, any, UpdateDish>,
    res: Response
  ) => {
    const id = req.params.id;
    const dish = req.body;
    const file = req.file;
    let path: string | undefined = undefined;
    if (file) {
      path = `${this._config.getValue("HOST_URL")}/public/images/${file.filename}`;
    }
    const pathObj = path ? { filePath: path } : {};
    const result = await this._dishService.updateDish(id, {
      ...dish,
      ...pathObj,
    });
    res.status(200).json(result);
  };
}

import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { DrinkService } from "./drink.service.js";
import { injectable } from "tsyringe";
import {
  CreateDrink,
  createDrinkSchema,
  UpdateDrink,
  updateDrinkSchema,
} from "./drink.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";
import { AppConfig } from "../config/appConfig.js";
import { FileUpload } from "../../file-upload/fileUpload.js";

@injectable()
export class DrinkController extends BaseController {
  constructor(
    private _drinkService: DrinkService,
    private _authentication: Authentication,
    private _config: AppConfig,
    private _fileUpload: FileUpload
  ) {
    super();

    const createDrinkValidationMiddleware = new CreateValidationMiddleware(
      createDrinkSchema
    ).getMiddleware();

    const updateDrinkValidationMiddleware = new CreateValidationMiddleware(
      updateDrinkSchema
    ).getMiddleware();

    const adminGuard = this._authentication.roleGuard("admin");

    this._router.get("/", this.getDrinks);
    this._router.get("/:id", this.getDrinkById);
    this._router.post(
      "/",
      adminGuard,
      this._fileUpload.upload.single("image"),
      createDrinkValidationMiddleware,
      this.createDrink
    );
    this._router.patch(
      "/:id",
      adminGuard,
      this._fileUpload.upload.single("image"),
      updateDrinkValidationMiddleware,
      this.updateDrink
    );

    this._router.delete("/:id", adminGuard, this.removeDrinkById);
  }

  getDrinks = async (req: Request, res: Response) => {
    const { name, category, available } = req.query;
    let drinks = await this._drinkService.getDrinks(req.query);
    if (name) {
      drinks = drinks.filter((d: any) =>
        d.name.toLowerCase().includes((name as string).toLowerCase())
      );
    }
    if (category) {
      drinks = drinks.filter((d: any) => d.categoryId === category);
    }
    if (available !== undefined) {
      drinks = drinks.filter(
        (d: any) => String(d.available) === String(available)
      );
    }
    res.status(200).json(drinks);
  };

  getDrinkById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._drinkService.getDrink(id);
    if (!result) throw new NotFoundError(`Drink with id ${id} not found`);
    res.status(200).json(result);
  };

  removeDrinkById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    await this._drinkService.deleteDrink(id);
    res.status(200).json({});
  };

  createDrink = async (req: Request<any, any, CreateDrink>, res: Response) => {
    const file = req.file;
    const path = file 
      ? `${this._config.getValue("HOST_URL")}/public/images/${file.filename}`
      : `${this._config.getValue("HOST_URL")}/public/images/default_drink.png`;
    const drink = req.body;
    const result = await this._drinkService.createDrink({
      ...drink,
      filePath: path,
    });
    res.status(200).json(result);
  };

  updateDrink = async (
    req: Request<{ id: string }, any, UpdateDrink>,
    res: Response
  ) => {
    const id = req.params.id;
    const drink = req.body;
    const file = req.file;
    let path: string | undefined = undefined;
    if (file) {
      path = `${this._config.getValue("HOST_URL")}/public/images/${file.filename}`;
    }
    const pathObj = path ? { filePath: path } : {};
    const result = await this._drinkService.updateDrink(id, {
      ...drink,
      ...pathObj,
    });
    res.status(200).json(result);
  };
}

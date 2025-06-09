import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { injectable } from "tsyringe";
import {
  CreateCategory,
  createCategorySchema,
  UpdateCategory,
  updateCategorySchema,
} from "./category.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";

@injectable()
export class CategoryController extends BaseController {
  constructor(
    private _categoryService: CategoryService,
    private _authentication: Authentication
  ) {
    super();

    const createCategoryValidationMiddleware = new CreateValidationMiddleware(
      createCategorySchema
    ).getMiddleware();

    const updateCategoryValidationMiddleware = new CreateValidationMiddleware(
      updateCategorySchema
    ).getMiddleware();

    const adminGuard = this._authentication.roleGuard("admin");

    this._router.get("/", this.getCategories);
    this._router.get("/:id", this.getCategoryById);
    this._router.post(
      "/",
      adminGuard,
      createCategoryValidationMiddleware,
      this.createCategory
    );
    this._router.patch(
      "/:id",
      adminGuard,
      updateCategoryValidationMiddleware,
      this.updateCategory
    );
    this._router.delete("/:id", adminGuard, this.removeCategoryById);
  }

  getCategories = async (req: Request, res: Response) => {
    const { name, type } = req.query;
    let categories = await this._categoryService.getCategories(req.query);
    
    if (name) {
      categories = categories.filter((c: any) =>
        c.name.toLowerCase().includes((name as string).toLowerCase())
      );
    }
    if (type) {
      categories = categories.filter((c: any) => c.type === type);
    }
    
    res.status(200).json(categories);
  };

  getCategoryById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._categoryService.getCategory(id);
    if (!result) throw new NotFoundError(`Category with id ${id} not found`);
    res.status(200).json(result);
  };

  removeCategoryById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    await this._categoryService.deleteCategory(id);
    res.status(200).json({});
  };

  createCategory = async (req: Request<any, any, CreateCategory>, res: Response) => {
    const category = req.body;
    const result = await this._categoryService.createCategory(category);
    res.status(200).json(result);
  };

  updateCategory = async (
    req: Request<{ id: string }, any, UpdateCategory>,
    res: Response
  ) => {
    const id = req.params.id;
    const category = req.body;
    const result = await this._categoryService.updateCategory(id, category);
    res.status(200).json(result);
  };
}

import "reflect-metadata";

import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import { CategoryRepository } from "./category.repository.js";
import { CreateCategory, Category, UpdateCategory } from "./category.schema.js";
import { SearchOptions } from "../../lib/IRepository.js";

@injectable()
export class CategoryService {
  private _categoryRepository: CategoryRepository;
  constructor(categoryRepository: CategoryRepository) {
    this._categoryRepository = categoryRepository;
  }

  async getCategories(options: SearchOptions<Category> = {}) {
    return this._categoryRepository.getAll(options);
  }

  async getCategory(id: string) {
    return this._categoryRepository.get(id);
  }

  async createCategory(category: CreateCategory) {
    const id = uuid();
    const data = { ...category, id };
    return this._categoryRepository.create(data);
  }

  async updateCategory(id: string, category: UpdateCategory) {
    return this._categoryRepository.update(id, category);
  }

  async deleteCategory(id: string) {
    return this._categoryRepository.delete(id);
  }
}

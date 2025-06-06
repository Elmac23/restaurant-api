import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { CreateCategory, Category, UpdateCategory } from "./category.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BaseRepository } from "../../lib/base.repository.js";

@injectable()
export class CategoryRepository
  extends BaseRepository
  implements IRepository<Category>
{
  private _db: JsonDB;
  constructor(db: JsonDB) {
    super();
    this._db = db;
  }

  async getAll(options: SearchOptions<Category> = {}) {
    const result = await tryOrNull(() => this._db.getData("/categories"));
    return this.withSearch(result, options);
  }

  async create(category: Category) {
    await this._db.push("/categories[]", category);
    return await this.get(category.id);
  }

  async get(id: string) {
    const categories = await tryOrNullAsync(() => this._db.getData(`/categories`));

    return categories?.find((c: Category) => c.id === id);
  }

  async update(id: string, category: UpdateCategory) {
    const categories = await tryOrNull(() => this._db.getData("/categories"));

    if (!categories.find((c: Category) => c.id === id))
      throw new NotFoundError(`Category with id ${id} not found`);

    const updated = categories.map((c: Category) => {
      if (c.id === id) return { ...c, ...category };
      else return c;
    });
    await this._db.push("/categories", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    const categories = await tryOrNull(() => this._db.getData("/categories"));
    const updated = categories.filter((c: Category) => c.id !== id);
    await this._db.push("/categories", updated, true);
  }
}

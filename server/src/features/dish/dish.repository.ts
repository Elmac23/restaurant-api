import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { CreateDish, Dish, UpdateDish } from "./dish.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BaseRepository } from "../../lib/base.repository.js";

@injectable()
export class DishRepository
  extends BaseRepository
  implements IRepository<Dish>
{
  private _db: JsonDB;
  constructor(db: JsonDB) {
    super();
    this._db = db;
  }

  async getAll(options: SearchOptions<Dish> = {}) {
    const result = await tryOrNull(() => this._db.getData("/dishes"));
    return this.withSearch(result, options);
  }

  async create(dish: Dish) {
    await this._db.push("/dishes[]", dish);
    return await this.get(dish.id);
  }

  async get(id: string) {
    const dishes = await tryOrNullAsync(() => this._db.getData(`/dishes`));

    return dishes?.find((d: Dish) => d.id === id);
  }

  async update(id: string, dish: UpdateDish) {
    const dishes = await tryOrNull(() => this._db.getData("/dishes"));

    if (!dishes.find((r: Dish) => r.id === id))
      throw new NotFoundError(`Dish with id ${id} not found`);

    const updated = dishes.map((r: Dish) => {
      if (r.id === id) return { ...r, ...dish };
      else return r;
    });
    await this._db.push("/dishes", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    const dishes = await tryOrNull(() => this._db.getData("/dishes"));
    const updated = dishes.filter((r: Dish) => r.id !== id);
    await this._db.push("/dishes", updated, true);
  }
}

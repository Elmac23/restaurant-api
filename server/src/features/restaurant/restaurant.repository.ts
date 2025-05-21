import "reflect-metadata";

import { JsonDB } from "node-json-db";
import {
  CreateRestaurant,
  Restaurant,
  UpdateRestaurant,
} from "./restaurant.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BaseRepository } from "../../lib/base.repository.js";

@injectable()
export class RestaurantRepository
  extends BaseRepository
  implements IRepository<Restaurant>
{
  private _db: JsonDB;
  constructor(db: JsonDB) {
    super();
    this._db = db;
  }

  async getAll(options: SearchOptions<Restaurant> = {}) {
    const result = await tryOrNull(() => this._db.getData("/restaurants"));
    return this.withSearch(result, options);
  }

  async create(restaurant: Restaurant) {
    await this._db.push("/restaurants[]", restaurant);
    return await this.get(restaurant.id);
  }

  async get(id: string) {
    const restaurants = await tryOrNullAsync(() =>
      this._db.getData(`/restaurants`)
    );

    return restaurants?.find((r: Restaurant) => r.id === id);
  }

  async update(id: string, restaurant: UpdateRestaurant) {
    const restaurants = await tryOrNull(() => this._db.getData("/restaurants"));

    if (!restaurants.find((r: Restaurant) => r.id === id))
      throw new NotFoundError(`Restaurant with id ${id} not found`);

    const updated = restaurants.map((r: Restaurant) => {
      if (r.id === id) return { ...r, ...restaurant };
      else return r;
    });
    await this._db.push("/restaurants", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    const restaurants = await tryOrNull(() => this._db.getData("/restaurants"));
    const updated = restaurants.filter((r: Restaurant) => r.id !== id);
    await this._db.push("/restaurants", updated, true);
  }
}

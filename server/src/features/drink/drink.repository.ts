import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { CreateDrink, Drink, UpdateDrink } from "./drink.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BaseRepository } from "../../lib/base.repository.js";
import { unlink } from "fs";

@injectable()
export class DrinkRepository
  extends BaseRepository
  implements IRepository<Drink>
{
  private _db: JsonDB;
  constructor(db: JsonDB) {
    super();
    this._db = db;
  }

  async getAll(options: SearchOptions<Drink> = {}) {
    const result = await tryOrNull(() => this._db.getData("/drinks"));
    return this.withSearch(result, options);
  }

  async create(drink: Drink) {
    await this._db.push("/drinks[]", drink);
    return await this.get(drink.id);
  }

  async get(id: string) {
    const drinks = await tryOrNullAsync(() => this._db.getData(`/drinks`));

    return drinks?.find((d: Drink) => d.id === id);
  }

  async update(id: string, drink: UpdateDrink) {
    const drinks = await tryOrNull(() => this._db.getData("/drinks"));

    if (!drinks.find((r: Drink) => r.id === id))
      throw new NotFoundError(`Drink with id ${id} not found`);

    const updated = drinks.map((r: Drink) => {
      if (r.id === id) return { ...r, ...drink };
      else return r;
    });
    await this._db.push("/drinks", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    const drinks = await tryOrNull(() => this._db.getData("/drinks"));
    const updated = drinks.filter((r: Drink) => r.id !== id);
    await this._db.push("/drinks", updated, true);
  }
}

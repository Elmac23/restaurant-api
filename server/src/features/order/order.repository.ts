import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { Order } from "./order.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BaseController } from "../../lib/base.controller.js";
import { BaseRepository } from "../../lib/base.repository.js";

@injectable()
export class OrderRepository
  extends BaseRepository
  implements IRepository<Order>
{
  private _db: JsonDB;
  constructor(db: JsonDB) {
    super();
    this._db = db;
  }

  async getAll(options: SearchOptions<Order> = {}) {
    const result = await tryOrNull(() => this._db.getData("/orders"));
    if (!result) return [];
    return this.withSearch(result, options);
  }

  async create(order: Order) {
    await this._db.push("/orders[]", order);
    return await this.get(order.id);
  }

  async get(id: string) {
    const orders = await tryOrNullAsync(() => this._db.getData(`/orders`));

    return orders?.find((r: Order) => r.id === id);
  }

  async update(id: string, order: Order) {
    const orders = await tryOrNull(() => this._db.getData("/orders"));

    if (!orders.find((r: Order) => r.id === id))
      throw new NotFoundError(`Order with id ${id} not found`);

    const updated = orders.map((r: Order) => {
      if (r.id === id) return { ...r, ...order };
      else return r;
    });
    await this._db.push("/orders", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    throw new Error("Method not implemented.");
    return await this.get(id);
  }
}

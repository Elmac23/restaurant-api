import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { CreateUser, User, UpdateUser } from "./user.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";

@injectable()
export class UserRepository implements IRepository<User> {
  private _db: JsonDB;
  constructor(db: JsonDB) {
    this._db = db;
  }

  async getAll() {
    return await tryOrNull(() => this._db.getData("/users"));
  }

  async create(user: User) {
    await this._db.push("/users[]", user);
    return await this.get(user.id);
  }

  async get(id: string) {
    const users = await tryOrNullAsync(() => this._db.getData(`/users`));

    return users?.find((r: User) => r.id === id);
  }

  async getByEmail(email: string) {
    const users = await tryOrNullAsync(() => this._db.getData(`/users`));

    return users?.find((r: User) => r.email === email);
  }

  async update(id: string, user: UpdateUser) {
    const users = await tryOrNull(() => this._db.getData("/users"));

    if (!users.find((r: User) => r.id === id))
      throw new NotFoundError(`User with id ${id} not found`);

    const updated = users.map((r: User) => {
      if (r.id === id) return { ...r, ...user };
      else return r;
    });
    await this._db.push("/users", updated, true);
    return await this.get(id);
  }

  async delete(id: string) {
    const users = await tryOrNull(() => this._db.getData("/users"));
    const updated = users.filter((r: User) => r.id !== id);
    await this._db.push("/users", updated, true);
  }
}

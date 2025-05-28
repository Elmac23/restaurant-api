import "reflect-metadata";

import { JsonDB } from "node-json-db";
import { CreateUser, User, UpdateUser, EditUser } from "./user.schema.js";
import { injectable } from "tsyringe";
import { tryOrNull, tryOrNullAsync } from "../../lib/tryOrNull.js";
import IRepository, { SearchOptions } from "../../lib/IRepository.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { BadRequestError } from "../../lib/errors/BadRequestError.js";
import { BaseRepository } from "../../lib/base.repository.js";

@injectable()
export class UserRepository
  extends BaseRepository
  implements IRepository<User>
{
  constructor(private _db: JsonDB) {
    super();
  }

  async getAll(options: SearchOptions<User> = {}) {
    const result = await tryOrNull(() => this._db.getData("/users"));
    return this.withSearch(result, options);
  }

  async create(user: User) {
    const isUniqueEmail = await this.isUniqueEmail(user.email);
    if (!isUniqueEmail)
      throw new BadRequestError(`User with email ${user.email} already exists`);
    await this._db.push("/users[]", user);
    return await this.get(user.id);
  }

  async get(id: string) {
    const users = await tryOrNullAsync(() => this._db.getData(`/users`));

    return users?.find((r: User) => r.id === id);
  }

  private async isUniqueEmail(email: string) {
    const userIsWithGivenEmail = await this.getByEmail(email);
    return !userIsWithGivenEmail;
  }

  async getByEmail(email: string) {
    const users = await tryOrNullAsync(() => this._db.getData(`/users`));

    return users?.find((r: User) => r.email === email);
  }

  async update(id: string, user: EditUser) {
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

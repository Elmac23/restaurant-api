import "reflect-metadata";
import { UserRepository } from "./user.repository.js";
import { CreateUser, UpdateUser, User } from "./user.schema.js";
import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { SearchOptions } from "../../lib/IRepository.js";

@injectable()
export class UserService {
  private _userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this._userRepository = userRepository;
  }

  async getUsers(options: SearchOptions<User> = {}) {
    return this._userRepository.getAll(options);
  }

  async getUser(id: string) {
    return this._userRepository.get(id);
  }

  async createUser(user: CreateUser) {
    const id = uuid();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const data = { ...user, id, hashedPassword };
    return this._userRepository.create(data);
  }

  async updateUser(id: string, user: UpdateUser) {
    return this._userRepository.update(id, user as any);
  }

  async deleteUser(id: string) {
    return this._userRepository.delete(id);
  }
}

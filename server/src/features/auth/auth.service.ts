import "reflect-metadata";

import { injectable } from "tsyringe";
import { CreateUser, RegisterUser, User } from "../user/user.schema.js";
import { v4 as uuid } from "uuid";
import { UserRepository } from "../user/user.repository.js";
import bcrypt from "bcrypt";
import { ForbiddenError } from "../../lib/errors/ForbiddenError.js";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/appConfig.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";

@injectable()
export class AuthService {
  constructor(
    private _userRepository: UserRepository,
    private _config: AppConfig
  ) {}

  async login(email: string, password: string) {
    const user = await this._userRepository.getByEmail(email);
    if (!user) throw new ForbiddenError(`Invalid credentials`);
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) throw new ForbiddenError(`Invalid credentials`);

    const { password: _, ...userWithoutPassword } = user;
    const { JWT_SECRET, JWT_EXPIRES_IN } = this._config.getConfig();
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });
    return token;
  }

  async register(user: RegisterUser) {
    const id = uuid();
    const password = user.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const data: User = { ...user, id, hashedPassword, role: "user" };
    await this._userRepository.create(data);
    return await this.login(user.email, password);
  }
}

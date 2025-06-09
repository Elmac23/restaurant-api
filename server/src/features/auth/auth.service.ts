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
import { MailSender } from "../mail-sender/mailSender.js";

@injectable()
export class AuthService {
  constructor(
    private _userRepository: UserRepository,
    private _config: AppConfig,
    private _mailSender: MailSender
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
    const { password, ...userWithoutPassword } = user;
    const id = uuid();
    const hashedPassword = await bcrypt.hash(password, 10);
    const data: User = {
      ...userWithoutPassword,
      id,
      hashedPassword,
      role: "klient", // domyślna rola
    };
    await this._userRepository.create(data);
    return await this.login(user.email, password);
  }

  requestChangePassword = async (email: string) => {
    const user = await this._userRepository.getByEmail(email);
    if (!user) throw new NotFoundError(`User with email ${email} not found`);
    const { JWT_RESET_EXPIRES_IN, JWT_SECRET, HOST_URL, CLIENT_URL } =
      this._config.getConfig();
    const token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: JWT_RESET_EXPIRES_IN as any,
    });
    const url = CLIENT_URL + `/reset-password?token=${token}`;
    await this._mailSender.sendMail({
      subject: "Reset password",
      to: email,
      text: `Please click on this link to reset your password: ${url}`,
    });
  };

  changePassword = async (token: string, password: string) => {
    const { email } = jwt.verify(
      token,
      this._config.getConfig().JWT_SECRET
    ) as {
      email: string;
    };
    const user = await this._userRepository.getByEmail(email);
    if (!user) throw new NotFoundError(`User with email ${email} not found`);
    const hashedPassword = await bcrypt.hash(password, 10);
    await this._userRepository.update(user.id, { hashedPassword });
  };
}

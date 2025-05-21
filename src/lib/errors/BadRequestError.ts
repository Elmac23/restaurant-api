import { APIError } from "./APIError.js";

export class BadRequestError extends APIError {
  constructor(message: string) {
    super(message, 400);
  }
}

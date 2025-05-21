import { APIError } from "./APIError.js";

export class ForbiddenError extends APIError {
  constructor(message: string) {
    super(message, 403);
  }
}

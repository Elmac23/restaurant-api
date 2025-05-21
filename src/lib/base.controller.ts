import Express from "express";

export class BaseController {
  protected _router: Express.Router;
  constructor() {
    this._router = Express.Router();
  }

  getRouter() {
    return this._router;
  }
}

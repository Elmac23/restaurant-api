import "reflect-metadata";
import { BaseController } from "../../lib/base.controller.js";
import { Request, Response } from "express";
import { OrderService } from "./order.service.js";
import { injectable } from "tsyringe";
import {
  CreateOrder,
  createOrderSchema,
  updateOrderSchema,
} from "./order.schema.js";
import { CreateValidationMiddleware } from "../../middleware/CreateValidationMiddleware.js";
import { NotFoundError } from "../../lib/errors/NotFoundError.js";
import { Authentication } from "../auth/auth.middleware.js";

@injectable()
export class OrderController extends BaseController {
  constructor(
    private _orderService: OrderService,
    _authentication: Authentication
  ) {
    super();

    const createOrderValidationMiddleware = new CreateValidationMiddleware(
      createOrderSchema
    ).getMiddleware();

    const updateOrderValidationMiddleware = new CreateValidationMiddleware(
      updateOrderSchema
    ).getMiddleware();

    const workerGuard = _authentication.roleGuard("worker");
    const managerGuard = _authentication.roleGuard("manager");

    this._router.get("/", this.getOrders);
    this._router.post("/", createOrderValidationMiddleware, this.createOrder);
    this._router.patch(
      "/:id",
      workerGuard,
      updateOrderValidationMiddleware,
      this.updateOrder
    );

    this._router.get("/:id", this.getOrderById);

    this._router.delete("/:id", managerGuard, this.removeOrderById);
  }

  getOrders = async (req: Request, res: Response) => {
    const role = req.user?.role ?? "user";
    if (role === "user") {
      const result = await this._orderService.getOrdersAsUser(
        req.user?.id ?? ""
      );
      res.status(200).json(result);
      return;
    }
    if (role === "worker" || role === "manager") {
      const result = await this._orderService.getRestaurantOrders(
        req.user?.restaurantId ?? ""
      );
      res.status(200).json(result);
      return;
    }

    const result = await this._orderService.getAllOrders();
    res.status(200).json(result);
  };

  getOrderById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._orderService.getOrder(id);
    if (!result) throw new NotFoundError(`Order with id ${id} not found`);

    if (req.user?.role === "user") {
      if (result.userId !== req.user.id) {
        throw new NotFoundError(`Order with id ${id} not found`);
      }
    }

    res.status(200).json(result);
  };

  removeOrderById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._orderService.deleteOrder(id);
    res.status(200).json(result);
  };

  createOrder = async (req: Request<any, any, CreateOrder>, res: Response) => {
    const order = req.body;
    const result = await this._orderService.createOrder(order);
    res.status(200).json(result);
  };

  updateOrder = async (
    req: Request<{ id: string }, any, any>,
    res: Response
  ) => {
    const id = req.params.id;
    const restaurant = req.body;
    const result = await this._orderService.updateOrder(id, restaurant);
    res.status(200).json(result);
  };
}

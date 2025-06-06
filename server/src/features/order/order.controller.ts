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
    const adminGuard = _authentication.roleGuard("admin");

    // Endpoint /my musi być PRZED endpointem /:id!
    this._router.get("/my", _authentication.authenticationMiddleware, _authentication.loggedInGuard, (req, res) => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Brak autoryzacji" });
        return;
      }
      
      // Extract query parameters for pagination
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      
      this._orderService
        .getOrdersAsUser(userId, { limit, page })
        .then((result) => res.status(200).json(result))
        .catch(() => res.status(500).json({ error: "Błąd serwera" }));
    });

    this._router.get("/", _authentication.authenticationMiddleware, _authentication.loggedInGuard, this.getOrders);
    this._router.get("/:id", this.getOrderById);
    this._router.post("/", createOrderValidationMiddleware, this.createOrder);
    this._router.patch(
      "/:id",
      _authentication.authenticationMiddleware,
      _authentication.loggedInGuard,
      updateOrderValidationMiddleware,
      this.updateOrder
    );
    this._router.delete("/:id", managerGuard, this.removeOrderById);
  }

  getOrders = async (req: Request, res: Response) => {
    const role = req.user?.role ?? "klient";
    
    // Extract query parameters for pagination
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    
    if (role === "klient") {
      const result = await this._orderService.getOrdersAsUser(
        req.user?.id ?? "",
        { limit, page }
      );
      res.status(200).json(result);
      return;
    }
    if (role === "worker" || role === "manager") {
      const result = await this._orderService.getRestaurantOrders(
        req.user?.restaurantId ?? "",
        { limit, page }
      );
      res.status(200).json(result);
      return;
    }

    // For admin, return all orders by default (no limit) unless specified
    const adminOptions = limit ? { limit, page } : {};
    const result = await this._orderService.getAllOrders(adminOptions);
    res.status(200).json(result);
  };

  getOrderById = async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;
    const result = await this._orderService.getOrder(id);
    if (!result) throw new NotFoundError(`Order with id ${id} not found`);

    if (req.user?.role === "klient") {
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
    const order = { ...req.body, userId: req.user?.id };
    const result = await this._orderService.createOrder(order);
    res.status(200).json(result);
  };

  updateOrder = async (
    req: Request<{ id: string }, any, any>,
    res: Response
  ) => {
    const id = req.params.id;
    const updateData = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Get the current order to check permissions
    const existingOrder = await this._orderService.getOrder(id);
    if (!existingOrder) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    // Permission checks
    if (userRole === "klient") {
      if (existingOrder.userId !== userId) {
        res.status(403).json({ error: "Brak uprawnień do edycji tego zamówienia" });
        return;
      }
      

      if (updateData.status && updateData.status !== 'cancelled') {
        res.status(403).json({ error: "Klienci mogą tylko anulować zamówienia" });
        return;
      }
      
      if (updateData.status === 'cancelled' && existingOrder.status !== 'pending') {
        res.status(403).json({ error: "Można anulować tylko zamówienia ze statusem 'oczekujące'" });
        return;
      }
    } else if (userRole === "worker" || userRole === "manager") {
      // Workers and managers can only update orders from their restaurant
      if (existingOrder.restaurantId !== req.user?.restaurantId) {
        res.status(403).json({ error: "Brak uprawnień do edycji zamówień z tej restauracji" });
        return;
      }
    }
    // Admins can update any order (no additional restrictions)

    const result = await this._orderService.updateOrder(id, updateData);
    res.status(200).json(result);
  };
}

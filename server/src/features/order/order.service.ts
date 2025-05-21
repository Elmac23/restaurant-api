import "reflect-metadata";
import { OrderRepository } from "./order.repository.js";
import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import { CreateOrder, Order, UpdateOrder } from "./order.schema.js";
import { RestaurantRepository } from "../restaurant/restaurant.repository.js";
import { DishRepository } from "../dish/dish.repository.js";

@injectable()
export class OrderService {
  constructor(
    private _orderRepository: OrderRepository,
    private _restaurantRepository: RestaurantRepository,
    private _dishRepository: DishRepository
  ) {}

  async getOrdersAsUser(userId: string) {
    return this._orderRepository.getAll({ userId });
  }

  async getRestaurantOrders(restaurantId: string) {
    const result = await this._orderRepository.getAll({ restaurantId });

    return result;
  }

  async getAllOrders() {
    const result = await this._orderRepository.getAll();
    return result;
  }

  async getOrder(id: string) {
    return this._orderRepository.get(id);
  }

  async createOrder(order: CreateOrder) {
    let total = 0;
    for (const item of order.items) {
      const dish = await this._dishRepository.get(item.id);
      total += dish.price * item.quantity;
    }
    const newOrder: Order = { ...order, id: uuid(), status: "pending", total };
    return this._orderRepository.create(newOrder);
  }

  async updateOrder(id: string, order: UpdateOrder) {
    return await this._orderRepository.update(id, order as Order);
  }

  async deleteOrder(id: string) {
    throw new Error("Method not implemented.");
  }
}

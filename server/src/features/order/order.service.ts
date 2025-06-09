import "reflect-metadata";
import { OrderRepository } from "./order.repository.js";
import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import { CreateOrder, Order, UpdateOrder } from "./order.schema.js";
import { RestaurantRepository } from "../restaurant/restaurant.repository.js";
import { DishRepository } from "../dish/dish.repository.js";
import { DrinkRepository } from "../drink/drink.repository.js";
import { SearchOptions } from "../../lib/IRepository.js";

@injectable()
export class OrderService {
  constructor(
    private _orderRepository: OrderRepository,
    private _restaurantRepository: RestaurantRepository,
    private _dishRepository: DishRepository,
    private _drinkRepository: DrinkRepository
  ) {}

  async getOrdersAsUser(userId: string, options: Partial<SearchOptions<Order>> = {}) {
    const result = await this._orderRepository.getAll({ userId, ...options });
    return await this.populateOrderItems(result);
  }

  async getRestaurantOrders(restaurantId: string, options: Partial<SearchOptions<Order>> = {}) {
    const result = await this._orderRepository.getAll({ restaurantId, ...options });
    return await this.populateOrderItems(result);
  }

  async getAllOrders(options: Partial<SearchOptions<Order>> = {}) {
    const result = await this._orderRepository.getAll(options);
    return await this.populateOrderItems(result);
  }

  private async populateOrderItems(orders: Order[]): Promise<Order[]> {
    return Promise.all(orders.map(async (order) => {
      if (!order.items) return order;
      
      const populatedItems = await Promise.all(order.items.map(async (item: any) => {
        let product;
        if (item.type === 'dish') {
          product = await this._dishRepository.get(item.id);
        } else if (item.type === 'drink') {
          product = await this._drinkRepository.get(item.id);
        }
        
        if (!product) {
          return {
            id: item.id,
            name: 'Produkt niedostępny',
            quantity: item.quantity,
            price: 0,
            type: item.type
          };
        }
        
        return {
          id: item.id,
          name: product.name,
          quantity: item.quantity,
          price: Number(product.price),
          type: item.type
        };
      }));
      
      return {
        ...order,
        items: populatedItems
      };
    }));
  }

  async getOrder(id: string) {
    const order = await this._orderRepository.get(id);
    if (!order) return null;
    
    const populatedOrders = await this.populateOrderItems([order]);
    return populatedOrders[0];
  }

  async createOrder(order: CreateOrder) {
    let total = 0;
    for (const item of order.items) {
      let product;
      if (item.type === 'dish') {
        product = await this._dishRepository.get(item.id);
      } else if (item.type === 'drink') {
        product = await this._drinkRepository.get(item.id);
      }
      if (!product) throw new Error('Nie znaleziono produktu w bazie');
      total += Number(product.price) * item.quantity;
    }
    const userId = (order as any).userId;
    const createdAt = new Date().toISOString();
    const paymentMethod = (order as any).paymentMethod || "gotówka";
    const paymentStatus = (order as any).paymentStatus || "oczekuje";
    const newOrder: Order = {
      ...order,
      id: uuid(),
      status: "pending",
      total,
      userId,
      createdAt,
      paymentMethod,
      paymentStatus,
    };
    return this._orderRepository.create(newOrder);
  }

  async updateOrder(id: string, order: UpdateOrder) {
    return await this._orderRepository.update(id, order as Order);
  }

  async deleteOrder(id: string) {
    throw new Error("Method not implemented.");
  }
}

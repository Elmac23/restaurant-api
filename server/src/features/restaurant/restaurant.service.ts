import "reflect-metadata";
import { RestaurantRepository } from "./restaurant.repository.js";
import { CreateRestaurant, UpdateRestaurant } from "./restaurant.schema.js";
import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";

@injectable()
export class RestaurantService {
  private _restaurantRepository: RestaurantRepository;
  constructor(restaurantRepository: RestaurantRepository) {
    this._restaurantRepository = restaurantRepository;
  }

  async getRestaurants() {
    return this._restaurantRepository.getAll();
  }

  async getRestaurant(id: string) {
    return this._restaurantRepository.get(id);
  }

  async createRestaurant(restaurant: CreateRestaurant) {
    const id = uuid();
    const data = { ...restaurant, id };
    return this._restaurantRepository.create(data);
  }

  async updateRestaurant(id: string, restaurant: UpdateRestaurant) {
    return this._restaurantRepository.update(id, restaurant);
  }

  async deleteRestaurant(id: string) {
    return this._restaurantRepository.delete(id);
  }
}

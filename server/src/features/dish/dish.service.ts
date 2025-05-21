import "reflect-metadata";

import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import { DishRepository } from "./dish.repository.js";
import { CreateDish, UpdateDish } from "./dish.schema.js";

@injectable()
export class DishService {
  private _dishRepository: DishRepository;
  constructor(dishRepository: DishRepository) {
    this._dishRepository = dishRepository;
  }

  async getDishes() {
    return this._dishRepository.getAll();
  }

  async getDish(id: string) {
    return this._dishRepository.get(id);
  }

  async createDish(dish: CreateDish) {
    const id = uuid();
    const data = { ...dish, id };
    return this._dishRepository.create(data);
  }

  async updateDish(id: string, dish: UpdateDish) {
    return this._dishRepository.update(id, dish);
  }

  async deleteDish(id: string) {
    return this._dishRepository.delete(id);
  }
}

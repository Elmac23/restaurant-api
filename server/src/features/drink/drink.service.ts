import "reflect-metadata";

import { injectable } from "tsyringe";
import { v4 as uuid } from "uuid";
import { DrinkRepository } from "./drink.repository.js";
import { CreateDrink, Drink, UpdateDrink } from "./drink.schema.js";
import { SearchOptions } from "../../lib/IRepository.js";

@injectable()
export class DrinkService {
  private _drinkRepository: DrinkRepository;
  constructor(drinkRepository: DrinkRepository) {
    this._drinkRepository = drinkRepository;
  }

  async getDrinks(options: SearchOptions<Drink> = {}) {
    return this._drinkRepository.getAll(options);
  }

  async getDrink(id: string) {
    return this._drinkRepository.get(id);
  }

  async createDrink(drink: CreateDrink) {
    const id = uuid();
    const data = { ...drink, id };
    return this._drinkRepository.create(data);
  }

  async updateDrink(id: string, drink: UpdateDrink) {
    return this._drinkRepository.update(id, drink);
  }

  async deleteDrink(id: string) {
    return this._drinkRepository.delete(id);
  }
}

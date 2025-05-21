import Express from "express";
import bodyParser from "body-parser";
import { errorHandling } from "./middleware/errorHandling.js";
import { config } from "dotenv";
import { JsonDB, Config } from "node-json-db";
import { RestaurantController } from "./features/restaurant/restaurant.controller.js";
import { container } from "tsyringe";
import { logBodyMiddleware } from "./middleware/logBodyMiddleware.js";
import { DishController } from "./features/dish/dish.controller.js";
import { DrinkController } from "./features/drink/drink.controller.js";
import { UserController } from "./features/user/user.controller.js";
import { AppConfig } from "./features/config/appConfig.js";
import { AuthController } from "./features/auth/auth.controller.js";
import { Authentication } from "./features/auth/auth.middleware.js";
import { OrderController } from "./features/order/order.controller.js";

config();

class Server {
  private _server: Express.Application;
  private _db: JsonDB;
  constructor() {
    this._db = new JsonDB(new Config("data/db", true, false, "/"));

    const authentication = container.resolve(Authentication);
    const config = container.resolve(AppConfig).getConfig();
    console.log(config);
    container.registerInstance(JsonDB, this._db);
    const restaurantController = container.resolve(RestaurantController);
    const dishesController = container.resolve(DishController);
    const drinksController = container.resolve(DrinkController);
    const userController = container.resolve(UserController);
    const authController = container.resolve(AuthController);
    const orderController = container.resolve(OrderController);

    this._server = Express();
    this._server.use(bodyParser.json());

    this._server.use(logBodyMiddleware);
    this._server.use(authentication.authenticationMiddleware);
    this._server.use("/restaurants", restaurantController.getRouter());
    this._server.use("/dishes", dishesController.getRouter());
    this._server.use("/drinks", drinksController.getRouter());
    this._server.use("/orders", orderController.getRouter());
    this._server.use("/users", userController.getRouter());
    this._server.use("/auth", authController.getRouter());
    this._server.use(errorHandling);
  }

  run = async (port: number = 5000) => {
    this._server.listen(port, async () => {
      try {
        console.log(`Server is running on http://localhost:${port}`);
      } catch (error) {
        console.error(error);
      } finally {
      }
    });
  };
}

const server = new Server();
server.run(Number(process.env.PORT));

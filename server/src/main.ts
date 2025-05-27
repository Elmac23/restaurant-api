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
import { AppDatabase } from "./db/AppDatabase.js";
import { FileUpload } from "./file-upload/fileUpload.js";
import { MailSender } from "./features/mail-sender/mailSender.js";

config();

class Server {
  private _server: Express.Application;
  private _appDatabase: AppDatabase;
  constructor() {
    const authentication = container.resolve(Authentication);
    const config = container.resolve(AppConfig).getConfig();
    const fileUpload = container.resolve(FileUpload);
    const mailSender = container.resolve(MailSender);

    const jsonDb = new JsonDB(new Config(config.DB_PATH, true, false, "/"));
    this._appDatabase = new AppDatabase(jsonDb);
    container.registerInstance(JsonDB, this._appDatabase.getDb());
    const restaurantController = container.resolve(RestaurantController);
    const dishesController = container.resolve(DishController);
    const drinksController = container.resolve(DrinkController);
    const userController = container.resolve(UserController);
    const authController = container.resolve(AuthController);
    const orderController = container.resolve(OrderController);

    this._server = Express();
    this._server.use(bodyParser.json());
    this._server.use(Express.urlencoded({ extended: true }));

    this._server.use(logBodyMiddleware);
    this._server.use(authentication.authenticationMiddleware);

    const masterRouter = Express.Router();

    masterRouter.use("/public", Express.static(config.PUBLIC_PATH));

    masterRouter.use("/restaurants", restaurantController.getRouter());
    masterRouter.use("/dishes", dishesController.getRouter());
    masterRouter.use("/drinks", drinksController.getRouter());
    masterRouter.use("/orders", orderController.getRouter());
    masterRouter.use("/users", userController.getRouter());
    masterRouter.use("/auth", authController.getRouter());

    this._server.use("/api", masterRouter);

    this._server.use(errorHandling);
  }

  run = async (port: number = 5000) => {
    this._server.listen(port, async () => {
      try {
        this._appDatabase.initDb();
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

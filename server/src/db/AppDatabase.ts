import { JsonDB } from "node-json-db";
import { injectable } from "tsyringe";
import { tryOrNullAsync } from "../lib/tryOrNull.js";
import { v4 as uuid } from "uuid";

@injectable()
export class AppDatabase {
  private _db: JsonDB;
  constructor(db: JsonDB) {
    this._db = db;
  }
  initDb = async () => {
    const fields = ["users", "dishes", "drinks", "orders", "restaurants", "categories"];
    for (const field of fields) {
      await this.initIalizeField(field);
    }
    
    
    await this.initializeDefaultCategories();
  };

  private initIalizeField = async (name: string) => {
    const field = await tryOrNullAsync(() => this._db.getData(`/${name}`));
    if (!field) await this._db.push(`/${name}`, []);
  };

  private initializeDefaultCategories = async () => {
    const categories = await tryOrNullAsync(() => this._db.getData("/categories"));
    
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        {
          id: uuid(),
          name: "Dania główne",
          description: "Główne dania serwowane w restauracji",
          type: "dish"
        },
        {
          id: uuid(),
          name: "Przystawki",
          description: "Lekkie przekąski i przystawki",
          type: "dish"
        },
        {
          id: uuid(),
          name: "Desery",
          description: "Słodkie zakończenie posiłku",
          type: "dish"
        },
        {
          id: uuid(),
          name: "Zupy",
          description: "Różnorodne zupy i rosołki",
          type: "dish"
        },
        {
          id: uuid(),
          name: "Napoje zimne",
          description: "Orzeźwiające napoje bezalkoholowe",
          type: "drink"
        },
        {
          id: uuid(),
          name: "Napoje gorące",
          description: "Kawa, herbata i inne gorące napoje",
          type: "drink"
        },
        {
          id: uuid(),
          name: "Soki",
          description: "Świeże soki owocowe i warzywne",
          type: "drink"
        },
        {
          id: uuid(),
          name: "Alkohol",
          description: "Napoje alkoholowe - piwo, wino",
          type: "drink"
        }
      ];

      await this._db.push("/categories", defaultCategories);
    }
  };

  getDb = () => this._db;
}

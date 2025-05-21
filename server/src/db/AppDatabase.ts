import { JsonDB } from "node-json-db";
import { injectable } from "tsyringe";
import { tryOrNullAsync } from "../lib/tryOrNull.js";

@injectable()
export class AppDatabase {
  private _db: JsonDB;
  constructor(db: JsonDB) {
    this._db = db;
  }
  initDb = async () => {
    const fields = ["users", "dishes", "drinks", "orders", "restaurants"];
    for (const field of fields) {
      await this.initIalizeField(field);
    }
  };

  private initIalizeField = async (name: string) => {
    const field = await tryOrNullAsync(() => this._db.getData(`/${name}`));
    if (!field) await this._db.push(`/${name}`, []);
  };

  getDb = () => this._db;
}

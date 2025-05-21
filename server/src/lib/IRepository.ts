interface IRepository<T> {
  getAll(options?: SearchOptions<T>): Promise<T[]>;
  get(id: string, options?: SearchOptions<T>): Promise<T>;
  create(item: T): Promise<T>;
  update(id: string, item: T): Promise<T>;
  delete(id: string): Promise<void>;
}

export type SearchOptions<T> = {
  limit?: number;
  page?: number;
  sort?: string;
} & {
  [Key in keyof T]?: T[Key];
};

export default IRepository;
export { IRepository };

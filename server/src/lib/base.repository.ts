import { SearchOptions } from "./IRepository.js";

export class BaseRepository {
  protected withLimit(array: any[], limit: number = 10, page: number = 1) {
    return array.slice((page - 1) * limit, page * limit);
  }

  protected withFilter<T>(
    array: any[],
    { limit, page, sort, ...queries }: SearchOptions<T>
  ) {
    return array.filter((item) =>
      Object.entries(queries).every(([key, value]) => item[key] === value)
    );
  }

  protected withSearch<T>(array: T[], search: SearchOptions<T>) {
    const filtered = this.withFilter(array, search);
    
    // Apply limit only if it's explicitly provided
    if (search.limit !== undefined) {
      return this.withLimit(filtered, search.limit, search.page);
    }
    
    return filtered;
  }
}

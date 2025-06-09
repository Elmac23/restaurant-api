import z from "zod";

export const createDishSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300),
  price: z.coerce.number().positive(),
  kcal: z.coerce.number().nonnegative(),
  categoryId: z.string().optional(),
  available: z.boolean().optional(),
  filePath: z.string().optional(),
});

export const updateDishSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  filePath: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  kcal: z.coerce.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  available: z.boolean().optional(),
});

export type CreateDish = z.infer<typeof createDishSchema>;
export type UpdateDish = z.infer<typeof updateDishSchema>;

export type Dish = CreateDish & { id: string };

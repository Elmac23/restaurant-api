import z from "zod";

export const createDrinkSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300),
  price: z.coerce.number().positive(),
  kcal: z.coerce.number().nonnegative(),
  categoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export const updateDrinkSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  price: z.coerce.number().positive().optional(),
  kcal: z.coerce.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export type CreateDrink = z.infer<typeof createDrinkSchema>;
export type UpdateDrink = z.infer<typeof updateDrinkSchema>;

export type Drink = CreateDrink & { id: string };

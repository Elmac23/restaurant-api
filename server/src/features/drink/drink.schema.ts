import z from "zod";

export const createDrinkSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300),
  price: z.number().min(0),
  kcal: z.number().min(0).max(5000),
});

export const updateDrinkSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  price: z.number().min(0).optional(),
  kcal: z.number().min(0).max(5000).optional(),
});

export type CreateDrink = z.infer<typeof createDrinkSchema>;
export type UpdateDrink = z.infer<typeof updateDrinkSchema>;

export type Drink = CreateDrink & { id: string };

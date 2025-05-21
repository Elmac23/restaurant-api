import z from "zod";

export const createDishSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300),
  price: z.number().min(0),
  kcal: z.number().min(0).max(5000),
});

export const updateDishSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  price: z.number().min(0).optional(),
  kcal: z.number().min(0).max(5000).optional(),
});

export type CreateDish = z.infer<typeof createDishSchema>;
export type UpdateDish = z.infer<typeof updateDishSchema>;

export type Dish = CreateDish & { id: string };

import z from "zod";

export const createDishSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300),
  price: z.string().refine(
    (v) => {
      let n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    { message: "Invalid number" }
  ),
  kcal: z.string().refine(
    (v) => {
      let n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    { message: "Invalid number" }
  ),
  filePath: z.string().optional(),
});

export const updateDishSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  filePath: z.string().optional(),
  price: z
    .string()
    .refine(
      (v) => {
        let n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" }
    )
    .optional(),
  kcal: z
    .string()
    .refine(
      (v) => {
        let n = Number(v);
        return !isNaN(n) && v?.length > 0;
      },
      { message: "Invalid number" }
    )
    .optional(),
});

export type CreateDish = z.infer<typeof createDishSchema>;
export type UpdateDish = z.infer<typeof updateDishSchema>;

export type Dish = CreateDish & { id: string };

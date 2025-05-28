import z from "zod";

export const createDrinkSchema = z.object({
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

export const updateDrinkSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
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
  filePath: z.string().optional(),
});

export type CreateDrink = z.infer<typeof createDrinkSchema>;
export type UpdateDrink = z.infer<typeof updateDrinkSchema>;

export type Drink = CreateDrink & { id: string };

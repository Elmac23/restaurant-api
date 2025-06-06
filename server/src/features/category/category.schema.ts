import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(300).optional(),
  type: z.enum(["dish", "drink"]), // kategorii dla dań i napojów
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(300).optional(),
  type: z.enum(["dish", "drink"]).optional(),
});

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Category = CreateCategory & { id: string };

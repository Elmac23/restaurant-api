import z from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(50),
  address: z.string().min(5).max(100),
  phoneNumber: z.string().min(8).max(16),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(50).optional(),
  address: z.string().min(5).max(100).optional(),
  phoneNumber: z.string().min(8).max(16).optional(),
});

export type CreateRestaurant = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurant = z.infer<typeof updateRestaurantSchema>;

export type Restaurant = CreateRestaurant & { id: string };

import z from "zod";

export const createOrderSchema = z.object({
  city: z.string().min(2).max(50),
  address: z.string().min(5).max(100),
  phoneNumber: z.string().min(8).max(16),
  items: z.array(z.object({ id: z.string(), quantity: z.number().min(1) })),
  userId: z.string().optional(),
  restaurantId: z.string(),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "delivered"]).optional(),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";
export type Order = CreateOrder & {
  id: string;
  status: OrderStatus;
  total: number;
};

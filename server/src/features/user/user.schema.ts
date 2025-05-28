import z from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
  lastname: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(50),
  address: z.string().min(5).max(100),
  phoneNumber: z.string().min(8).max(16),
  password: z.string(),
  role: z.enum(["user", "worker", "manager", "admin"]),
  restaurantId: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(100).optional(),
  lastname: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(50).optional(),
  address: z.string().min(5).max(100).optional(),
  phoneNumber: z.string().min(8).max(16).optional(),
  password: z.string().optional(),
  role: z.enum(["user", "worker", "manager", "admin"]).optional(),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
  lastname: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(50),
  address: z.string().min(5).max(100),
  phoneNumber: z.string().min(8).max(16),
  password: z.string(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

export type User = Omit<CreateUser, "password"> & {
  id: string;
  hashedPassword: string;
};

export type EditUser = Omit<UpdateUser, "password"> & {
  hashedPassword: string;
};

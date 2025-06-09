import apiClient from '../client';

export interface CreateOrderPayload {
  city: string;
  address: string;
  phoneNumber: string;
  items: { id: string; quantity: number; type: 'dish' | 'drink' }[];
  restaurantId: string;
}

export async function createOrder(order: CreateOrderPayload, userId?: string) {
  const payload = userId ? { ...order, userId } : order;
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

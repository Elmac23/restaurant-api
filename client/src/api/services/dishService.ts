import apiClient from '../client';

export async function getDishesFiltered(params: { name?: string; category?: string; categoryId?: string; available?: boolean }) {
  const query = new URLSearchParams();
  if (params.name) query.append('name', params.name);
  if (params.category) query.append('category', params.category);
  if (params.categoryId) query.append('categoryId', params.categoryId);
  if (params.available !== undefined) query.append('available', String(params.available));
  const response = await apiClient.get(`/dishes?${query.toString()}`);
  return response.data;
}

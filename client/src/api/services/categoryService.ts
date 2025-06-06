import apiClient from '../client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'dish' | 'drink';
}

export async function getCategories(type?: 'dish' | 'drink') {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  
  const response = await apiClient.get(`/categories?${params.toString()}`);
  return response.data;
}

export async function createCategory(category: Omit<Category, 'id'>) {
  const response = await apiClient.post('/categories', category);
  return response.data;
}

export async function updateCategory(id: string, category: Partial<Omit<Category, 'id'>>) {
  const response = await apiClient.patch(`/categories/${id}`, category);
  return response.data;
}

export async function deleteCategory(id: string) {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
}

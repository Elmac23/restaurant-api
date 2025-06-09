export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | string;
  kcal: number | string;
  categoryId?: string;
  filePath?: string;
  available?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'dish' | 'drink';
}
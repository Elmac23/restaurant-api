export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  kcal: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
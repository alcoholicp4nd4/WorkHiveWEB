export type UserRole = 'provider' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
  avatar_url?: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  provider_id: string;
  category_id: string;
  created_at: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  service: Service;
}
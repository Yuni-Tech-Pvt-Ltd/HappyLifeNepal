export interface AboutUs {
  id: string;
  title: string;
  content: string;
  mission?: string;
  vision?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  image_url?: string;
  published_at?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Statistics {
  total_children: number;
  total_volunteers: number;
  total_products: number;
  total_donors: number;
}

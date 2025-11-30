export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail_url?: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail_url?: string;
  published: boolean;
}

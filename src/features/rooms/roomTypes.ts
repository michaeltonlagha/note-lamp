export interface ReadingRoom {
  id: string;
  name: string;
  description: string;
  book_title: string;
  book_author: string;
  total_pages: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  email?: string;
}

export interface RoomProgress {
  id: string;
  room_id: string;
  user_id: string;
  current_page: number;
  updated_at: string;
}

export interface RoomPost {
  id: string;
  room_id: string;
  user_id: string;
  content: string | null;
  page_reference: number | null;
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
  author_email?: string;
}

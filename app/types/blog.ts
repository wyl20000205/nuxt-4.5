export type PostItem = {
  id: number;
  author: string;
  avatar: string;
  time: number;
  content: string;
  img_list?: string[];
  likes: number;
  replies: number;
  uuid: string;
  username: string;
};

export type BlogPost = {
  id: number;
  uuid: string;
  username: string;
  user_id: number;
  text: string;
  img_list: string[];
  time: number;
  likeCount: number;
  commentCount: number;
  liked: boolean;
};

export type EditablePost = {
  id: number;
  text: string;
  images: string[];
  userId?: number;
};

export type ManagedPost = EditablePost & {
  userId: number;
  imageCount: number;
  time: number;
};

export type AdminManagedPost = ManagedPost & {
  active: boolean;
  authorActive: boolean;
};

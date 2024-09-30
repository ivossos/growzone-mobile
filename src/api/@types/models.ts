export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface DefaultResponse {
  status: boolean;
  message: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

//SOCIAL
export interface UserSocial {
  id: number;
  name: string;
  username: string;
  biography: string;
  document: string;
  date_of_birth: string;
  email: string;
  phone: string;
  image?: UserImage;
  cover?: UserCover;
  hashed_password: string;
  category_id: number;
  indicated_by_id: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  biography: string;
  created_at: string;
}

export interface UserImage {
  id: number;
  image: string;
  created_at?: string;
}

export interface UserCover {
  id: number;
  cover: string;
  created_at: string;
}

export interface UserMetrics {
  following: number;
  followers: number;
  review_count: number;
  average_review: number;
}

export interface UserProfile {
  info: UserInfo;
  image: UserImage;
  cover: UserCover;
  metric: UserMetrics;
}

export interface CreateUserImage {
  is_active: boolean;
  id: number;
  user_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserCover {
  is_active: boolean;
  id: number;
  user_id: number;
  cover: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  is_active: boolean;
  id: number;        
  follower_id: number;
  followed_id: number;
  created_at: string; 
  updated_at?: string;
}

export interface UserDTO {
  id: number;
  name: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

export interface Review {
  id: number;
  reviewer: UserDTO;
  value: number;
  content: string;
  created_at: string;
  is_active: boolean;
}

export interface ReadReview {
  value: number;
  content: string;
  is_active: boolean;
  id: number;
  reviewer_id: number;
  reviewed_id: number;
  created_at: string;
  updated_at: string;
}

export interface Following {
  id: number;
  followed: UserDTO;
  created_at: string; 
  is_active: boolean;
}

export interface Follower {
  id: number;
  follower: UserDTO;
  created_at: string; 
  is_active: boolean;
}
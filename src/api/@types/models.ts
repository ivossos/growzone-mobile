import { VideoPlayer, VideoSource } from "expo-video";
import { GlobalSearchType, PostType, TimelineType } from "./enums";

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  hashed_password: string;
  created_at: string;
  updated_at: "2019-08-24T14:15:22Z";
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
  name?: string;
  has_username?: boolean;
  username: string;
  biography?: string;
  document?: string;
  date_of_birth?: string;
  email: string;
  phone?: string;
  image?: UserImage;
  cover?: UserCover;
  hashed_password: string;
  category_id?: number;
  indicated_by_id?: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id: number;
  name?: string;
  username: string;
  biography?: string;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
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
  social_count: number;
  reel_count: number;
}

export interface UserProfile {
  info: UserInfo;
  image?: UserImage;
  cover?: UserCover;
  metric: UserMetrics;
}

export interface UserCategory {
  id: number;
  name: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
  name?: string;
  username: string;
  created_at: string;
  is_active: boolean;
  image?: UserImage;
  is_following: boolean;
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

export interface GlobalSearchUser {
  id: number;
  image: UserImage;
  name: string;
  username: string;
  created_at: string;
  is_following: boolean;
}

export interface SocialPostFile {
  id: number;
  file: string;
  type: "video" | "image";
  created_at: string;
  player: VideoPlayer;
}

export interface SocialPost {
  id: number;
  post_id: number;
  file: SocialPostFile;
  view_count: number;
  description?: string;
  created_at: string;
  is_compressing: boolean;
}

export interface PostDetail {
  id: number;
  post_id: number;
  user: {
    id: number;
    image: {
      id: number;
      image: string;
      created_at: string;
    };
    name: string;
    username: string;
    created_at: string;
    is_following: boolean;
  };
  files: SocialPostFile[];
  description?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  is_compressing: boolean;
  is_liked: boolean;
}

export interface ReelsDetail {
  id: number;
  post_id: number;
  user: {
    id: number;
    image: {
      id: number;
      image: string;
      created_at: string;
    };
    name: string;
    username: string;
    created_at: string;
    is_following: boolean;
  };
  file: SocialPostFile;
  description?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  view_count: number;
  is_compressing: boolean;
  is_liked: boolean;
  is_viewed: boolean;
  player: VideoPlayer;
}

export interface Comment {
  id: number;
  user: UserDTO;
  content: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  is_liked: boolean;
  subComments?: Array<Comment>;
  parentId?: number | null;
}

export interface PostLike {
  id: number;
  user: UserDTO;
  created_at: string;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface View {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CommentLike {
  id: number;
  user_id: number;
  comment_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Genetic {
  name: string;
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Phase {
  name: string;
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface File {
  id: number;
  file: string;
  type: "image" | "video";
  created_at: string;
  player: VideoPlayer;
}
export interface Strain {
  id: number;
  name: string;
  created_at: string;
}

export interface Phase {
  id: number;
  name: string;
  created_at: string;
}

export interface GrowPost {
  id: number;
  post_id: number;
  file: File;
  strain: Strain;
  phase: Phase;
  day: number;
  created_at: string;
  is_compressing: boolean;
}

export interface GrowPostDetail {
  id: number;
  post_id: number;
  user: UserDTO;
  files: File[];
  strain: Strain;
  phase: Phase;
  day: number;
  description: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  is_liked: boolean;
  is_viewed: boolean;
  is_compressing: boolean;
}

export interface FeedAllPost {
  type: PostType;
  post: GrowPostDetail | PostDetail | ReelsDetail;
}

export interface ReportReason {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SenderImage {
  id: number;
  image: string;
  created_at: string;
}

export interface Sender {
  id: number;
  image: SenderImage;
  name: string;
  username: string;
  created_at: string;
  is_following: boolean;
}

export interface NotificationType {
  id: number;
  name:
  | "Review Profile"
  | "Report Post"
  | "Comment Post"
  | "Like Post"
  | "Follow Profile";
  description: string;
  created_at: string;
}

export interface PostFile {
  id: number;
  file: File;
  type: "image" | "video";
  created_at: string;
}

export interface Post {
  id: number;
  type: "grow" | "social" | "reel";
  file: File;
  created_at: string;
}

export interface Notification {
  id: number;
  sender: Sender;
  type: NotificationType;
  post: Post;
  created_at: string;
  is_read: boolean;
}

export interface Lead {
  id: number;
  user_id: number;
  store_name: string;
  department: string;
  product_quantity: number;
  average_revenue: number;
  erp_name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Blocked {
  id: number;
  blocked: UserDTO;
  created_at: string;
}

export interface MediaUpload {
  uri: string;
  fileName: string;
  type: string;
}

export interface CreateGenetic {
  name: string;
}

export interface CreateCommentBody {
  postId: number;
  content: string;
  parentId?: number;
}

export interface GetPostCommentsProps {
  postId: number;
  parentId?: number;
  skip?: number;
  limit?: number;
}

export interface GlobalSearchParams {
  type: GlobalSearchType;
  strain_id: number;
  phase_id: number;
  query: string;
  skip: number;
  limit: number;
}

export interface TimelineParams {
  type: TimelineType;
  skip: number;
  limit: number;
  userId: number;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  replace: (source: VideoSource) => void;
  mutedVideo: (mutedVideo: boolean) => void;
}

export interface UpdateGrowPost {
  post_id: number;
  description?: string;
  day: number;
  strain_id: number;
  phase_id: number;
}

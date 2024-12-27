import { CreateCommentBody } from "@/api/@types/models";
import { socialApi } from "@/lib/axios";

interface CreateCommentResponse {
  content: string;
  id: number;
  user_id: number;
  post_id: number;
  parent_id: number;
  created_at: string;
  updated_at: string;
  is_fixed: boolean;
  is_active: boolean;
}

export default async function createComment({ postId, content, parentId }: CreateCommentBody) {

  const response = await socialApi.post<CreateCommentResponse>('/comment/', {
    post_id: postId,
    content: content,
    parent_id: parentId
  });

  return response.data;
}

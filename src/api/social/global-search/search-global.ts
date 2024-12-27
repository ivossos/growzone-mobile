import { socialApi } from "@/lib/axios";
import { GlobalSearchParams, GlobalSearchUser } from "@/api/@types/models";

export async function searchGlobal(params: Pick<GlobalSearchParams, 'limit' | 'query' | 'skip'>) {
  const response = await socialApi.get<Array<GlobalSearchUser>>(
    "/global-research/",
    {
      params,
    }
  );

  return response.data;
}

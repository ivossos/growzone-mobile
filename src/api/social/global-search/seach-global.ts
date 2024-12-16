import { socialApi } from "@/lib/axios";
import { GlobalSearchParams, GlobalSearchResponse } from "@/api/@types/models";

export async function searchGlobal(params: GlobalSearchParams) {
  const response = await socialApi.get<GlobalSearchResponse>(
    "/new-global-research/",
    {
      params,
    }
  );

  return response.data;
}

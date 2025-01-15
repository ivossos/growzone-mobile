import { socialApi } from "@/lib/axios";
import { GlobalSearchParams, GrowPost } from "@/api/@types/models";

interface GlobalSearchPostData
  extends Partial<Pick<GlobalSearchParams, "strain_id" | "phase_id">>,
    Pick<GlobalSearchParams, "skip" | "limit"> {}

export async function searchGrowPost(params: GlobalSearchPostData) {
  const response = await socialApi.get<Array<GrowPost>>("/grow-research/", {
    params,
  });

  return response.data;
}

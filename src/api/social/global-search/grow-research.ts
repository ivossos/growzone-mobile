import { socialApi } from "@/lib/axios";
import {
  GlobalSearchParams,
  GrowPost,
} from "@/api/@types/models";

export async function searchGrowPost(
  params: Pick<GlobalSearchParams, "strain_id" | "skip" | "limit" | "phase_id">
) {
  const response = await socialApi.get<Array<GrowPost>>("/grow-research/", {
    params,
  });

  return response.data;
}

import { TEST_HCA_IDS_BY_DOI } from "../../../testing/constants";

export function getProjectIdByDoi(doi: string): string | null {
  return TEST_HCA_IDS_BY_DOI.get(doi) ?? null;
}

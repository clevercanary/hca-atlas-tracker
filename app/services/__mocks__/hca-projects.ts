import { TEST_HCA_IDS_BY_DOI } from "../../../testing/constants";

export function getProjectIdByDoi(dois: string[]): string | null {
  for (const doi of dois) {
    const id = TEST_HCA_IDS_BY_DOI.get(doi);
    if (id) return id;
  }
  return null;
}

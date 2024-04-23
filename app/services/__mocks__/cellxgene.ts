import { TEST_CELLXGENE_IDS_BY_DOI } from "testing/constants";

export function getCellxGeneIdByDoi(dois: string[]): string | null {
  for (const doi of dois) {
    const id = TEST_CELLXGENE_IDS_BY_DOI.get(doi);
    if (id) return id;
  }
  return null;
}

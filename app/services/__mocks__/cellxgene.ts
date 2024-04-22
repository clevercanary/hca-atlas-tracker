import { TEST_CELLXGENE_IDS_BY_DOI } from "testing/constants";

export function getCellxGeneIdByDoi(doi: string): string | null {
  return TEST_CELLXGENE_IDS_BY_DOI.get(doi) ?? null;
}

import { TEST_DOI_CROSSREF_WORKS } from "../../../../testing/constants";

export async function fetchCrossrefWork(doi: string): Promise<unknown | null> {
  const work = TEST_DOI_CROSSREF_WORKS.get(doi);
  if (!work) return null;
  return work;
}

/**
 * Get data from the Crossref API for the work with the given DOI.
 * @param doi - DOI of the work to fetch.
 * @returns promise for unvalidated Crossref work, or for null if the work wasn't found.
 */
export async function fetchCrossrefWork(doi: string): Promise<unknown | null> {
  const crossrefResponse = await fetch(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`
  );
  if (crossrefResponse.status === 404) return null;
  else if (crossrefResponse.status !== 200)
    throw new Error(
      `Received ${crossrefResponse.status} response from Crossref`
    );
  return (await crossrefResponse.json()).message;
}

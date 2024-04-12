import { PublicationInfo } from "../apis/catalog/hca-atlas-tracker/common/entities";

interface CrossrefWork {
  author: ({ name: string } | { family: string; given?: string })[];
  "container-title": string[];
  institution?: { name: string }[];
  published: {
    "date-parts": number[][];
  };
  "short-container-title": string[];
  title: string[];
}

/**
 * Checks whether a string matches DOI syntax, including DOI URLs.
 * @param value - String to test.
 * @returns true if the value is a syntactically-valid DOI.
 */
export function isDoi(value: string): boolean {
  return /^10\.[\d.]*\/.*$/.test(normalizeDoi(value));
}

export function normalizeDoi(doi: string): string {
  if (/^https:\/\/doi\.org\//i.test(doi)) {
    doi = decodeURIComponent(new URL(doi).pathname.replace(/^\//, ""));
  }
  return doi.toLowerCase();
}

export async function getCrossrefPublicationInfo(
  doi: string
): Promise<PublicationInfo | null> {
  const crossrefResponse = await fetch(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`
  );
  if (crossrefResponse.status === 404) return null;
  else if (crossrefResponse.status !== 200)
    throw new Error(
      `Received ${crossrefResponse.status} response from Crossref`
    );
  const work = (await crossrefResponse.json()).message as CrossrefWork;
  return {
    authors: work.author.map((author) =>
      "name" in author
        ? { name: author.name, personalName: null }
        : { name: author.family, personalName: author.given || null }
    ),
    journal:
      work["container-title"][0] ||
      work["short-container-title"][0] ||
      work.institution?.[0].name ||
      null,
    publicationDate: work.published["date-parts"][0].join("-"),
    title: work.title[0],
  };
}

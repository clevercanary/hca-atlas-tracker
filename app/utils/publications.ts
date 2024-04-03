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

export function normalizeDoi(doi: string): string {
  if (/^https:\/\/doi\.org\//.test(doi)) {
    return decodeURIComponent(new URL(doi).pathname.replace(/^\//, ""));
  } else {
    return doi;
  }
}

export async function getPublicationInfo(
  doi: string
): Promise<PublicationInfo | null> {
  const work = (
    await (
      await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
    ).json()
  ).message as CrossrefWork;
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

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

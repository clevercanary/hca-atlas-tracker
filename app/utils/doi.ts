/**
 * Checks whether a string matches DOI syntax, including DOI URLs.
 * @param value - String to test.
 * @returns true if the value is a syntactically-valid DOI.
 */
export function isDoi(value: string): boolean {
  return /^10\.[\d.]*\/.*$/.test(normalizeDoi(value));
}

export function normalizeDoi(doi: string): string {
  doi = doi.trim();
  const urlMatch = /^(?:https?:\/\/)?(doi\.org\/.*$)/i.exec(doi);
  if (urlMatch) {
    const [, nonProtocolPart] = urlMatch;
    doi = decodeURIComponent(
      new URL("https://" + nonProtocolPart).pathname.replace(/^\//, "")
    ).trim();
  }
  return doi.toLowerCase();
}

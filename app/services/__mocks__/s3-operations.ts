export async function getDownloadUrl(
  key: string,
  filename: string,
): Promise<string> {
  return "https://example.com/" + key + "?filename=" + filename;
}

/**
 * Download the given file.
 * @param fileName - File name.
 * @param fileUrl - File URL.
 */
export function downloadFile(fileName?: string, fileUrl?: string): void {
  if (!fileName || !fileUrl) return;
  const anchorEl = document.createElement("a");
  anchorEl.href = fileUrl;
  anchorEl.download = fileName;
  document.body.appendChild(anchorEl);
  anchorEl.click();
  document.body.removeChild(anchorEl);
}

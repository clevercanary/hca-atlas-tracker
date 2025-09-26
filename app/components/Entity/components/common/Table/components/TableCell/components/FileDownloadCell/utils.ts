/**
 * Download the given file.
 * TODO: confirm use of this function.
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

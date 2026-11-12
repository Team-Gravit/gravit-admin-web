/** Save authenticated downloads without depending on Content-Disposition headers. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    // Let the browser start consuming the object URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

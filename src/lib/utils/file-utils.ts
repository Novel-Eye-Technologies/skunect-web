/** Check if a URL points to an image based on its extension or content-type hint */
export function isImageUrl(url: string): boolean {
  // Check file extension (handles query params after extension)
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)) return true;
  // Check for content-type hint appended as query param (e.g., ?ct=image/jpeg)
  try {
    const params = new URL(url).searchParams;
    const ct = params.get('ct');
    if (ct && ct.startsWith('image/')) return true;
  } catch {
    // not a valid URL, skip
  }
  return false;
}

/** Extract a displayable filename from a URL */
export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split('/').pop() || url);
  } catch {
    return url.split('/').pop() || url;
  }
}

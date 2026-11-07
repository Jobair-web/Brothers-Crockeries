/**
 * Adds an ImageKit transformation (?tr= / &tr=) to ImageKit links so a big original photo
 * is delivered at the size the page needs. Other links (Cloudinary, local files...) are returned untouched.
 */
export function ikResize(url: string | undefined, transform: string): string | undefined {
  if (!url || !/^https:\/\/[^/]*imagekit\.io\//i.test(url) || /[?&]tr=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}tr=${transform}`;
}
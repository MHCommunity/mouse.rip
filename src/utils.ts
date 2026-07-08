/**
 * Formats a number with commas as thousands separators.
 *
 * @param {number} num The number to format
 *
 * @return {string} The formatted number as a string
 */
export function formatNumber(num: number): string {
	return num?.toLocaleString() || '0';
}

/**
 * Cleans and formats a description by removing HTML tags and normalizing whitespace.
 *
 * @param {string} description The description to clean
 * @return {string} The cleaned description
 */
export function cleanDescription(description: string): string {
	if (!description) return '';
	return description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
		.trim();
}

/**
 * Whether a URL is a relative path within this Next app, and therefore safe to
 * navigate to with the client router (and to apply view transitions to).
 *
 * @param {string} url The URL to check
 * @return {boolean} True for paths like `/guides/foo`
 */
export function isInternalPath(url: string): boolean {
	return typeof url === 'string' && url.startsWith('/');
}

/**
 * Whether a URL points to one of our own pages — either a relative path or a
 * `mouse.rip` (or subdomain) host. Used to attribute and style links to
 * mouse.rip differently from outbound links.
 *
 * @param {string} url The URL to check
 * @return {boolean} True for mouse.rip pages
 */
export function isOurUrl(url: string): boolean {
	if (!url) return false;
	if (isInternalPath(url)) return true;
	try {
		const { hostname } = new URL(url);
		return hostname === 'mouse.rip' || hostname.endsWith('.mouse.rip');
	} catch {
		return false;
	}
}

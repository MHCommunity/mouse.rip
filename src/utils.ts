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

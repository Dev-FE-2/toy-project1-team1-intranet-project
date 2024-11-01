/**
 * @param {string} text 
 * @param {number} limit
 * @returns 
 */
export default function cuttingString(text, limit) {
  if (text.length > limit) {
    return text.slice(0, limit) + '...';
  }
  return text;
}
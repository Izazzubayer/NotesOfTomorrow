import mammoth from "mammoth";

// Known Google Play Books metadata lines to strip — these are never real highlights
const GOOGLE_PLAY_NOISE = [
  /^this document is overwritten/i,
  /^you should make a copy/i,
  /^annotations by color/i,
  /^\d+ (yellow|green|red|blue|purple) notes/i,
  /notes?\s*•\s*\d+/i,
  /created by .+ last synced/i,
  /last synced/i,
  /highlights from:/i,
  /^highlights?$/i,
  /^notes?$/i,
];

/** Extract highlights as text strings from a Google Play .docx export */
export async function parseGooglePlayBook(buffer: Buffer): Promise<string[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.filter((line) => {
    if (line.length < 30) return false;             // too short to be a real highlight
    if (line.match(/^\d+$/)) return false;           // just a page number
    if (line.match(/^Page \d+/i)) return false;      // "Page 12" headers
    if (GOOGLE_PLAY_NOISE.some((re) => re.test(line))) return false;
    return true;
  });
}

/**
 * Try to extract the book title + author from the .docx document properties.
 * Google Play .docx exports usually put the book title as the document title
 * and author in the description or first heading.
 */
export async function extractGooglePlayMeta(
  buffer: Buffer
): Promise<{ title: string; author: string }> {
  try {
    // mammoth can extract document messages/warnings that sometimes include title info
    const { value } = await mammoth.extractRawText({ buffer });
    const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);

    // Google Play exports often put "Highlights from: TITLE by AUTHOR" at the top
    for (const line of lines.slice(0, 10)) {
      const match = line.match(/highlights from[:\s]+(.+?)\s+by\s+(.+)/i);
      if (match) {
        return { title: match[1].trim(), author: match[2].trim() };
      }
    }

    // Sometimes just: "TITLE\nAUTHOR" in the first two non-empty lines
    if (lines[0] && lines[0].length < 100) {
      return { title: lines[0], author: lines[1]?.length < 60 ? lines[1] : "" };
    }
  } catch {
    // ignore
  }

  return { title: "", author: "" };
}

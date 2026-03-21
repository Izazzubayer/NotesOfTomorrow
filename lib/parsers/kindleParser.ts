/**
 * Parses a Kindle "My Clippings.txt" export.
 *
 * Kindle format per entry:
 *   Line 0: "Book Title (Author Name)"
 *   Line 1: "- Your Highlight on Location X | Added on..."
 *   Line 2: (blank)
 *   Line 3+: Highlight text
 *   ==========
 */

/** Extract the most common book title + author from the Kindle file header lines */
export function extractKindleMeta(text: string): { title: string; author: string } {
  const sections = text.split("==========");
  const titleCounts: Record<string, number> = {};

  for (const section of sections) {
    const lines = section.trim().split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    const headerLine = lines[0].trim();
    // Only count lines that look like "Title (Author)" format
    if (headerLine && !headerLine.startsWith("-") && headerLine.length > 3) {
      titleCounts[headerLine] = (titleCounts[headerLine] || 0) + 1;
    }
  }

  // Pick the most frequent header (the main book)
  const topTitle = Object.entries(titleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  // Kindle format: "Atomic Habits (James Clear)"
  const match = topTitle.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { title: match[1].trim(), author: match[2].trim() };
  }

  return { title: topTitle || "", author: "" };
}

/** Extract highlight strings from a Kindle "My Clippings.txt" file */
export function parseKindleExport(text: string): string[] {
  // ── Strategy 1: Proper Kindle clippings format ──────────────────────────
  if (text.includes("==========") && text.toLowerCase().includes("your highlight")) {
    const highlights: string[] = [];
    const sections = text.split("==========");

    for (const section of sections) {
      const lines = section.trim().split("\n").filter(Boolean);
      if (lines.length >= 2 && lines[1]?.toLowerCase().includes("your highlight")) {
        const highlightText = lines.slice(2).join(" ").trim();
        if (highlightText.length > 15) highlights.push(highlightText);
      }
    }

    if (highlights.length > 0) return highlights;
  }

  // ── Strategy 2: Plain text / Google Play txt export ─────────────────────
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.filter(
    (line) =>
      line.length > 15 &&
      !line.match(/^\d+$/) &&
      !line.match(/^Page \d+/i) &&
      !line.match(/^Chapter/i) &&
      !line.match(/^---+$/)
  );
}

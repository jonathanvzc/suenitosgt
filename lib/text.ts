export const normalizeInlineText = (value?: string | null) =>
  (value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ; ")
    .replace(/\s{2,}/g, " ")
    .trim();

export function cleanOCRText(rawText: string): string {
  let cleaned = rawText;

  // Remove common OCR noise characters
  cleaned = cleaned.replace(/[|{}[\]~`^]/g, '');

  // Fix multiple spaces
  cleaned = cleaned.replace(/  +/g, ' ');

  // Fix multiple line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Fix common OCR misreads
  cleaned = cleaned.replace(/['']/g, "'");
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/…/g, '...');

  // Remove lines that are just numbers (page numbers)
  cleaned = cleaned.replace(/^\d{1,3}$/gm, '');

  // Remove leading/trailing whitespace on each line
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return cleaned.trim();
}

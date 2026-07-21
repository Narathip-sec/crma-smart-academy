// Category dropdowns come back nameTh-alphabetized from the API, which
// scatters "อื่น ๆ" (Other) into the middle of the list depending on Thai
// unicode ordering. Convention is Other always sorts last.

function isOther(nameTh: string): boolean {
  const trimmed = nameTh.trim();
  return trimmed === "อื่น ๆ" || trimmed === "อื่นๆ";
}

export function sortOtherLast<T extends { nameTh: string }>(items: T[]): T[] {
  const rest = items.filter((i) => !isOther(i.nameTh));
  const other = items.filter((i) => isOther(i.nameTh));
  return [...rest, ...other];
}

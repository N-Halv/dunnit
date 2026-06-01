// Helpers shared between listsSlice and itemsSlice. The backend's SortOrder is
// a double; some JSON pipelines (depending on .NET serializer config) emit it
// as a string, so normalize before comparing.

type Sortable = { sortOrder: number | string };

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function sortBySortOrder<T extends Sortable>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => toNumber(a.sortOrder) - toNumber(b.sortOrder),
  );
}

export function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}


export function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}
export function find<T>(
  array: ReadonlyArray<T>,
  predicate: (element: T, index: number, array: ReadonlyArray<T>) => boolean,
  context?: any,
): T | undefined {
  for (var ii = 0; ii < array.length; ii++) {
    if (predicate.call(context, array[ii], ii, array)) {
      return array[ii];
    }
  }
  return undefined;
}

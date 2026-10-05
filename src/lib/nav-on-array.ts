export function navToNext<T>(array: T[]): T[] {
  if (array.length === 0) {
    return array;
  }
  const firstElement = array.shift()!;
  array.push(firstElement);
  return array;
}

export function navToPrevious<T>(array: T[]): T[] {
  if (array.length === 0) {
    return array;
  }
  const lastElement = array.pop()!;
  array.unshift(lastElement);
  return array;
}

export function getUnique<T>(x: T[]): T[] {
    return x.filter((value, index, array) => array.indexOf(value) === index);
} 
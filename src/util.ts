export const noop = () => {};

export const arrayPut = <T>(array: T[], item: T, index?: number) => {
  // must check against undefined because index might === 0
  index === undefined ? array.push(item) : array.splice(index, 0, item);
};

export function arrayMove(arr: any[], fromIndex: number, toIndex: number) {
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }

  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

export const isObjectLiteral = (v: any): v is object => {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && typeof v !== 'function';
};

export const defaultNamespaced = (actionType: string) => `relational/${actionType}`;

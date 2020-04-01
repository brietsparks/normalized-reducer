export const noop = () => {};

export const arrayPut = <T>(item: T, array?: T[], index?: number): T[] => {
  if (!array) {
    return [item];
  }

  const newArray = [...array];
  // must check against undefined because index might === 0
  index === undefined ? newArray.push(item) : newArray.splice(index, 0, item);
  return newArray;
};

export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || toIndex < 0) {
    return arr;
  }

  // if the fromIndex is greater than the highest index, then set it as the highest index
  fromIndex = fromIndex > arr.length - 1 ? arr.length - 1 : fromIndex;

  const newArray = [...arr];
  const element = newArray[fromIndex];
  newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, element);

  return newArray;
}

export const isObjectLiteral = (v: any): v is object => {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && typeof v !== 'function';
};

export const defaultNamespaced = (actionType: string) => `relational/${actionType}`;

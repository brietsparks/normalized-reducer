export const noop = () => {};

export const arrayPut = <T>(array: T[], item: T, index?: number) => {
  // must check against undefined because index might === 0
  index === undefined
    ? array.push(item)
    : array.splice(index, 0, item);
};

export function arrayMove(arr: any[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

export const defaultNamespaced = (actionType: string) => `relational/${actionType}`;

export const defaultInvalidEntityHandler = (entity: string) => {
  throw new Error(`invalid entity "${entity}"`);
};
export const defaultInvalidRelHandler = (entity: string, rel: string) => {
  throw new Error(`invalid rel "${rel}" in entity "${entity}"`)
};

export function deepFreeze(o: any) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o.hasOwnProperty(prop)
      && o[prop] !== null
      && (typeof o[prop] === 'object' || typeof o[prop] === 'function')
      && !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });

  return o;
}

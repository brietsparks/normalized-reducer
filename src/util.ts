export const noop = () => {};

export const defaultNamespaced = (actionType: string) => `relational/${actionType}`;

export const defaultInvalidEntityHandler = (entity: string) => {
  throw new Error(`invalid entity "${entity}"`);
};
export const defaultInvalidRelHandler = (entity: string, rel: string) => {
  throw new Error(`invalid rel "${rel}" in entity "${entity}"`)
};

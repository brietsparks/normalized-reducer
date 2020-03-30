export const entityTypeDne = (entityType: string) => `Entity-type "${entityType}" does not exist`;

export const relDne = (entityType: string, rel: string) =>
  `Entity "${entityType}" does not have a relation named "${rel}"`;

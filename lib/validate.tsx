export const requireFields = (
  data: Record<string, unknown>,
  fields: string[]
) => {
  for (const field of fields) {
    if (!data[field]) {
      return `Falta el campo: ${field}`;
    }
  }
  return null;
};

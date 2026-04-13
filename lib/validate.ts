export const requireFields = (data: any, fields: string[]) => {
  for (const field of fields) {
    if (!data[field]) {
      return `Falta el campo: ${field}`;
    }
  }
  return null;
};
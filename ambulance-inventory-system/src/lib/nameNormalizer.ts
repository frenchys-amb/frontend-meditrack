/**
 * Normaliza nombres de equipos y medicamentos
 * Convierte: angio_20 → angio_20, Angio #20 → angio_20, ANGIO 20 → angio_20
 */
export const normalizeName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Compara dos nombres normalizados
 */
export const compareNormalizedNames = (name1: string, name2: string): boolean => {
  return normalizeName(name1) === normalizeName(name2);
};
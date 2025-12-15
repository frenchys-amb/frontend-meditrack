import * as XLSX from 'xlsx';

/**
 * Exporta datos a un archivo CSV.
 * @param data - Array de objetos a exportar.
 * @param filename - Nombre del archivo a descargar.
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Obtiene los encabezados de las claves del primer objeto
  const headers = Object.keys(data[0]);

  // Convierte los datos a formato CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escapa comillas y envuelve en comillas si contiene comas o comillas
      const escaped = (typeof value === 'string' && (value.includes(',') || value.includes('"'))) ? `"${value.replace(/"/g, '""')}"` : value;
      return escaped;
    }).join(',');
  });

  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Crea un blob y descarga el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta datos a un archivo XLSX (Excel).
 * @param data - Array de objetos a exportar.
 * @param filename - Nombre del archivo a descargar.
 */
export const exportToXLSX = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Crea una nueva hoja de cálculo
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  // Escribe el archivo y lo descarga
  XLSX.writeFile(wb, filename);
};
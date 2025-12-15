// src/utils/pdfReports.ts 
// este va con storageequipmentpage
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CATEGORY_CONFIG } from '@/config/inventoryConfig';

export const generateInventoryReport = (equipment: any[]) => {
  const doc = new jsPDF();

  // 1. Encabezado
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216);
  doc.text("Reporte Maestro de Inventario", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 14, 28);
  
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 32, 196, 32);

  // 2. Datos
  const tableData = equipment.map(item => {
    const isLowStock = item.quantity < 5;
    return [
      item.name,
      CATEGORY_CONFIG[item.category]?.label || 'Sin Categoría',
      item.quantity,
      isLowStock ? 'CRÍTICO' : 'Normal',
      new Date(item.created_at).toLocaleDateString('es-ES')
    ];
  });

  // 3. Tabla
  autoTable(doc, {
    startY: 38,
    head: [['Nombre del Equipo', 'Categoría', 'Stock', 'Estado', 'Fecha Registro']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 3, textColor: [55, 65, 81] },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'CRÍTICO') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    },
    foot: [['', 'Total', `${equipment.length} items`, '', '']],
    footStyles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [30, 41, 59] }
  });

  // 4. Guardar
  doc.save(`Inventario_Equipos_${new Date().toISOString().slice(0, 10)}.pdf`);
};
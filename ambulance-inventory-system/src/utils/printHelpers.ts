// este va con storagemedicationpage
import { isExpired, isNearExpiration, formatDate } from '@/lib/utils';
import { STATUS_CONFIG } from '@/config/medicationConfig';

export const printMedicationReport = (medications: any[]) => {
  const printWindow = window.open('', '_blank', 'height=800,width=1000');
  if (!printWindow) return;
  
  const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Inventario Farmacia - ${today}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: -1px; }
          .meta { text-align: right; font-size: 13px; color: #6b7280; }
          h1 { font-size: 24px; margin: 0; color: #111827; font-weight: 800;}
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th { background-color: #f3f4f6; text-align: left; padding: 12px 16px; font-weight: 700; color: #4b5563; text-transform: uppercase; font-size: 12px; letter-spacing: 0.8px; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status { font-weight: 700; font-size: 11px; padding: 4px 8px; border-radius: 6px; display: inline-block; }
          .expired { color: #991b1b; background-color: #fee2e2; border: 1px solid #fca5a5; }
          .near { color: #b45309; background-color: #fef3c7; border: 1px solid #fcd34d; }
          .good { color: #065f46; background-color: #d1fae5; border: 1px solid #6ee7b7; }
          .low-stock { color: #dc2626; font-weight: 800; }
          .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">INVENTARIO FARMACIA</div>
          <div class="meta">
            <p>Reporte de Existencias</p>
            <p>Fecha de Generación: <strong>${today}</strong></p>
          </div>
        </div>
        <h1>Lista Maestra de Medicamentos</h1>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
          Total de registros: <strong>${medications.length}</strong>.
        </p>
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Medicamento</th>
              <th style="width: 15%;">Stock Actual</th>
              <th style="width: 25%;">Fecha de Vencimiento</th>
              <th style="width: 20%;">Estado de Caducidad</th>
            </tr>
          </thead>
          <tbody>
            ${medications.map(item => {
              const expired = isExpired(item.expiration_date);
              const near = isNearExpiration(item.expiration_date);
              let statusClass = 'good';
              let statusText = STATUS_CONFIG.GOOD.text;
              if (expired) { statusClass = 'expired'; statusText = STATUS_CONFIG.EXPIRED.text; }
              else if (near) { statusClass = 'near'; statusText = STATUS_CONFIG.NEAR.text; }

              return `
                <tr>
                  <td style="font-weight: 600; color: #111;">${item.name}</td>
                  <td class="${item.quantity < 10 ? 'low-stock' : ''}">${item.quantity} unids.</td>
                  <td>${formatDate(item.expiration_date)}</td>
                  <td><span class="status ${statusClass}">${statusText}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="footer">Documento generado automáticamente.</div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
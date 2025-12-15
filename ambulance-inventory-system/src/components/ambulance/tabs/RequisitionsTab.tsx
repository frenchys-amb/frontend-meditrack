// este va con ambulanceDetailpage
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";

interface Props {
  requisitions: any[];
  onView: (item: any) => void;
}

export const RequisitionsTab = ({ requisitions, onView }: Props) => {

  // Función para contar correctamente sin importar el formato (Viejo o Nuevo)
  const getRealItemCount = (data: any) => {
    if (!data) return 0;

    // 1. Formato Nuevo (JSON con propiedad 'items')
    if (data.items && Array.isArray(data.items)) {
      return data.items.length;
    }

    // 2. Formato Intermedio (Es un Array directo)
    if (Array.isArray(data)) {
      return data.length;
    }

    // 3. Formato Viejo (Objeto Clave-Valor), filtramos metadatos para no contarlos como items
    return Object.keys(data).filter(key => key !== 'generated_at' && key !== 'reason').length;
  };

  return (
    <Card className="shadow-md border-slate-100 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <FileText className="h-5 w-5 text-purple-600" /> Solicitudes de Reposición
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-800">
            <TableRow>
              <TableHead className="text-white">Fecha</TableHead>
              <TableHead className="text-white">Contenido</TableHead>
              <TableHead className="text-right text-white">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-slate-400">
                  No hay requisiciones registradas.
                </TableCell>
              </TableRow>
            )}
            {requisitions.map((item) => (
              <TableRow key={item.id} className="hover:bg-purple-50/30">
                <TableCell className="font-medium text-slate-700">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString("es-ES")
                    : new Date(item.date).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    {/* Usamos la función para obtener el número real */}
                    {getRealItemCount(item.requisition_data)} items
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-purple-700 hover:bg-purple-100"
                    onClick={() => onView(item)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
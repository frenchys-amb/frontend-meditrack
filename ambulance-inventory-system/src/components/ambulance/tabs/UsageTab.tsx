// Este va con AmbulanceDetailsPage
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Eye } from "lucide-react";

interface Props {
  usageLogs: any[];
  onView: (item: any) => void;
}

export const UsageTab = ({ usageLogs, onView }: Props) => {
  return (
    <Card className="shadow-md border-slate-100 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <TrendingDown className="h-5 w-5 text-orange-600" /> Logs de Consumo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-800">
            <TableRow>
              <TableHead className="text-white">Fecha</TableHead>
              <TableHead className="text-white">Consumo</TableHead>
              <TableHead className="text-right text-white">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usageLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-slate-400">
                  No hay registros de consumo.
                </TableCell>
              </TableRow>
            )}
            {usageLogs.map((item) => (
              <TableRow key={item.id} className="hover:bg-orange-50/30">
                <TableCell className="font-medium text-slate-700">
                  {item.created_at 
                    ? new Date(item.created_at).toLocaleString("es-ES") 
                    : new Date(item.date).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    {Array.isArray(item.usage_data) 
                      ? item.usage_data.length 
                      : Object.keys(item.usage_data || {}).length} items
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-orange-700 hover:bg-orange-100" 
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
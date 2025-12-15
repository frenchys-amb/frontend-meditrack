// este es con ambulanceDetailPage
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { UserCell } from "@/components/ambulance/UserCell";

export const HistoryTab = ({ checklists, onView }: { checklists: any[], onView: (item: any) => void }) => (
  <Card className="shadow-md border-slate-100 rounded-2xl">
    <CardHeader><CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800"><ClipboardList className="h-5 w-5 text-green-600" /> Historial de Inspecciones</CardTitle></CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader className="bg-slate-50"><TableRow><TableHead>Fecha</TableHead><TableHead>Responsable</TableHead><TableHead className="text-right">Detalle</TableHead></TableRow></TableHeader>
        <TableBody>
          {checklists.map((item) => (
            <TableRow key={item.id} className="hover:bg-green-50/30">
              <TableCell className="font-medium">{new Date(item.created_at || item.date).toLocaleString()}</TableCell>
              <TableCell><UserCell userId={item.user_id} /></TableCell>
              <TableCell className="text-right"><Button size="sm" variant="ghost" className="text-green-700" onClick={() => onView(item)}>Ver Informe</Button></TableCell>
            </TableRow>
          ))}
          {checklists.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-6 text-slate-400">No hay checklists recientes.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
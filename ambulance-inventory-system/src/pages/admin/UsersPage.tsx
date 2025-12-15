import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Mail, X, Archive, Lock, Loader2, UserCircle2, Calendar } from "lucide-react"; // Se añadió Calendar para la fecha

// --- IMPORTS LIMPIOS ---
import { createNewUser, getAllUsers, deleteUser, updateUser } from "@/lib/admin";
import { changeUserPassword } from "@/lib/password";
import { User } from "@/types";
import { ROLE_CONFIG } from "@/config/userConfig";

// --- MODALES (NO MODIFICADOS) ---
import { AddUserDialog } from "@/components/admin/modals/AddUserDialog";
import { EditUserDialog } from "@/components/admin/modals/EditUserDialog";
import { ChangePasswordDialog } from "@/components/admin/modals/ChangePasswordDialog";

// Componentes de tabla simples (Sin cambios)
const Table = ({ children, ...props }: any) => (
  <table className="w-full" {...props}>{children}</table>
);
const TableHeader = ({ children, ...props }: any) => (
  <thead {...props}>{children}</thead>
);
const TableBody = ({ children, ...props }: any) => (
  <tbody {...props}>{children}</tbody>
);
const TableRow = ({ children, className = "", ...props }: any) => (
  <tr className={className} {...props}>{children}</tr>
);
const TableHead = ({ children, className = "", ...props }: any) => (
  <th className={`text-left px-4 ${className}`} {...props}>{children}</th>
);
const TableCell = ({ children, className = "", ...props }: any) => (
  <td className={`px-4 ${className}`} {...props}>{children}</td>
);

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Control de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);

  // Usuario Seleccionado
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- CARGA DE DATOS (NO MODIFICADA) ---
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      (u.username ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // --- ACCIONES (Business Logic - NO MODIFICADA) ---

  const handleCreate = async (newUser: any) => {
    try {
      const result = await createNewUser(newUser.email, newUser.password, newUser.username, {
        full_name: newUser.full_name, role: newUser.role,
      });
      if (!result || 'error' in result) throw new Error((result as any)?.message || "Error al crear.");

      toast({ title: "Éxito 🎉", description: `Usuario ${newUser.full_name} creado.` });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error ❌", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateUser(id, data);
      toast({ title: "Éxito ✅", description: "Usuario actualizado." });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error ❌", description: error.message, variant: "destructive" });
    }
  };

  const handlePasswordReset = async (id: string, pass: string) => {
    try {
      await changeUserPassword(id, pass);
      toast({ title: "Contraseña actualizada 🔑", description: "Acceso restablecido." });
    } catch (error: any) {
      toast({ title: "Error ❌", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("⚠️ ¿Eliminar usuario permanentemente?")) return;
    try {
      await deleteUser(id);
      toast({ title: "Eliminado 🗑️", description: "Usuario borrado del sistema.", variant: "destructive" });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error ❌", description: error.message, variant: "destructive" });
    }
  };

  // --- RENDER ---
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-slate-200">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
        <Loader2 className="h-14 w-14 text-indigo-600 animate-spin relative z-10" />
      </div>
      <p className="text-slate-600 font-bold mt-6 text-lg">Cargando directorio...</p>
      <p className="text-slate-400 text-sm mt-1">Obteniendo información del personal</p>
    </div>
  );

  return (
    // Fondo más oscuro para mejorar el contraste de las tarjetas blancas
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 p-6 lg:p-10">
      <main className="max-w-7xl mx-auto space-y-8">

        {/* HEADER MEJORADO */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl opacity-50"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-2xl shadow-slate-300/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {/* Ícono de la Cabecera con degradado más vívido */}
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl shadow-xl shadow-indigo-500/40">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  {/* Título con gradiente y tipografía audaz */}
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-slate-500 mt-2 text-base font-medium">Administración de accesos y roles del personal</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">{users.length} Registros</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Botón con estilo más impactante */}
              <Button
                onClick={() => setIsAddOpen(true)}
                className="group bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white shadow-xl shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/50 rounded-xl h-12 px-8 font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </header>

        {/* TABLE CARD MEJORADA */}
        <Card className="group border border-slate-200/70 shadow-3xl shadow-slate-300/40 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-4xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-br from-white to-indigo-50/50 border-b border-slate-200/70 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-7 bg-gradient-to-b from-indigo-600 to-fuchsia-600 rounded-full"></div>
                  Directorio de Personal
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium mt-1">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-96 group">
                <Input
                  placeholder="Buscar por nombre, usuario, email o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-10 rounded-xl bg-white border-slate-300 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 h-11 shadow-md font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-3 flex items-center hover:bg-slate-100 rounded-lg px-1 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Header de tabla más oscuro para alto contraste */}
                <TableRow className="bg-slate-900 border-none">
                  <TableHead className="text-white font-extrabold py-4 pl-8 text-xs uppercase tracking-widest">USUARIO</TableHead>
                  <TableHead className="text-white font-extrabold text-xs uppercase tracking-widest">EMAIL</TableHead>
                  <TableHead className="text-white font-extrabold text-xs uppercase tracking-widest">ROL</TableHead>
                  <TableHead className="text-white font-extrabold hidden md:table-cell text-xs uppercase tracking-widest">REGISTRO</TableHead>
                  <TableHead className="text-white font-extrabold text-right pr-8 text-xs uppercase tracking-widest">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-6 bg-slate-50 rounded-2xl mb-4">
                          <Archive className="h-16 w-16 text-slate-300" />
                        </div>
                        <p className="text-slate-600 font-bold text-lg">No se encontraron resultados</p>
                        <p className="text-slate-400 text-sm mt-1">Intenta con otros términos de búsqueda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      // Efecto hover más sutil y profesional
                      className="group hover:bg-slate-50/70 border-b border-slate-100/70 transition-all duration-300 ease-in-out"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="py-4 pl-8">
                        <div className="flex items-center gap-4">
                          {/* Ícono de usuario más grande y colorido */}
                          <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-inner group-hover:shadow-md transition-shadow">
                            <UserCircle2 className="h-6 w-6 text-indigo-700" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">
                              {user.full_name || "Sin nombre"}
                            </span>
                            {/* Etiqueta de usuario más compacta y legible */}
                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1 w-fit">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                          <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Mail className="h-3.5 w-3.5 text-indigo-500" />
                          </div>
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Mejora el estilo del badge de Rol si está disponible en ROLE_CONFIG */}
                        <div className="inline-flex">
                          {ROLE_CONFIG[user.role]?.badge || (
                            <span className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 hidden md:table-cell font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          {new Date(user.created_at).toLocaleDateString("es-ES", {
                            day: 'numeric', // Cambiado a 'numeric' para formato 1, 2, 3...
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedUser(user); setIsEditOpen(true); }}
                            className="h-9 w-9 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105" // Iconos un poco más pequeños y efecto de escala
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedUser(user); setIsPassOpen(true); }}
                            className="h-9 w-9 hover:bg-amber-100 text-slate-500 hover:text-amber-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            className="h-9 w-9 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* --- MODALES INYECTADOS (NO MODIFICADOS) --- */}
        <AddUserDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onConfirm={handleCreate} />
        <EditUserDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={selectedUser} onConfirm={handleUpdate} />
        <ChangePasswordDialog isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} user={selectedUser} onConfirm={handlePasswordReset} />

      </main>
    </div>
  );
};

export default UsersPage;
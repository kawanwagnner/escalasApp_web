import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useProfiles } from "../hooks";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { profileService } from "../services/profile.service";
import { Users, Music, BookOpen, Search, Plus, Shield, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Membros = () => {
  const { data: membros = [], isLoading } = useProfiles();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMembro, setSelectedMembro] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const filteredMembros = membros.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateMember = async () => {
    if (!createForm.fullName || !createForm.email || !createForm.password) return;
    
    setIsCreating(true);
    try {
      await authService.signUp(createForm.email, createForm.password, createForm.fullName);
      setShowCreateModal(false);
      setCreateForm({ fullName: "", email: "", password: "" });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (error: any) {
      console.error("Erro ao cadastrar membro:", error);
      alert(error.response?.data?.msg || "Erro ao cadastrar membro");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleRole = async () => {
    if (!selectedMembro) return;
    
    setIsUpdatingRole(true);
    try {
      const newRole = selectedMembro.role === 'admin' ? 'member' : 'admin';
      await profileService.updateProfile(selectedMembro.id, { role: newRole });
      setShowRoleModal(false);
      setSelectedMembro(null);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      alert("Erro ao atualizar permissão do membro");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const openRoleModal = (membro: any) => {
    setSelectedMembro(membro);
    setShowRoleModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
            <p className="text-gray-600 mt-1">
              {membros.length} membros cadastrados
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Membro
            </Button>
          )}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar membro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {membros.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Music className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Músicos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {membros.filter((m) => m.is_musician).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Professores
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {membros.filter((m) => m.is_teacher).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Membros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembros.map((membro) => (
            <Card key={membro.id} hover>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRandomColor(
                    membro.full_name
                  )}`}
                >
                  {getInitials(membro.full_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {membro.full_name}
                    </h3>
                    {membro.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {membro.is_musician && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        Músico
                      </span>
                    )}
                    {membro.is_teacher && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Professor
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === 'admin' && membro.id !== user.id && (
                  <button
                    onClick={() => openRoleModal(membro)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Alterar permissão"
                  >
                    <Shield className="h-5 w-5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredMembros.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum membro encontrado</p>
            </div>
          </Card>
        )}

        {/* Modal Criar Membro */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Cadastrar Novo Membro"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMember} isLoading={isCreating}>
                Cadastrar
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Nome completo"
              value={createForm.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateForm({ ...createForm, fullName: e.target.value })
              }
              placeholder="Nome do membro"
            />
            <Input
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              placeholder="email@exemplo.com"
            />
            <Input
              label="Senha"
              type="password"
              value={createForm.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              placeholder="Senha inicial"
            />
            <p className="text-sm text-gray-500">
              O membro poderá alterar a senha depois no perfil.
            </p>
          </div>
        </Modal>

        {/* Modal Alterar Role */}
        <Modal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title="Alterar Permissão"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleToggleRole} isLoading={isUpdatingRole}>
                Confirmar
              </Button>
            </div>
          }
        >
          {selectedMembro && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRandomColor(
                    selectedMembro.full_name
                  )}`}
                >
                  {getInitials(selectedMembro.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedMembro.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedMembro.email}</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Permissão atual:</p>
                <p className="font-semibold flex items-center gap-2">
                  {selectedMembro.role === 'admin' ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                      <span className="text-amber-700">Administrador</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-700">Membro</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 border-2 border-dashed rounded-lg bg-blue-50 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Nova permissão:</p>
                <p className="font-semibold flex items-center gap-2">
                  {selectedMembro.role === 'admin' ? (
                    <>
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-700">Membro</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                      <span className="text-amber-700">Administrador</span>
                    </>
                  )}
                </p>
              </div>

              {selectedMembro.role !== 'admin' && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  ⚠️ Administradores têm acesso total ao sistema, incluindo criar/editar ministérios, escalas, eventos e gerenciar outros membros.
                </p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

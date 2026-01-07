import React, { useState } from "react";

import { UserCircle, Mail, Calendar, Edit, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { profileService } from "../services";
import { Layout } from "../components/layout";
import { Button, Card, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
  });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await profileService.updateProfile(user.id, formData);
      setIsEditing(false);
      window.location.reload(); // Recarregar para atualizar o contexto
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <Card>
          <p className="text-center text-gray-500">Carregando...</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="h-24 w-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.full_name || "Sem nome"}
              </h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role === "admin" ? "👑 Admin" : "👤 Membro"}
                </span>
              </div>
            </div>
            <div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "secondary" : "primary"}
              >
                {isEditing ? (
                  <>Cancelar</>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card title="Informações Pessoais">
          {isEditing ? (
            <div className="space-y-6">
              <Input
                label="Nome Completo"
                value={formData.full_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  isLoading={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: user.full_name,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <UserCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Nome Completo</div>
                  <div className="font-medium text-gray-900">
                    {user.full_name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Membro desde</div>
                  <div className="font-medium text-gray-900">
                    {format(
                      new Date(user.created_at),
                      "dd 'de' MMMM 'de' yyyy",
                      {
                        locale: ptBR,
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Account Stats */}
        <Card title="📊 Minhas Estatísticas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">ID</div>
              <div className="text-sm text-gray-600">
                {user.id.slice(0, 8)}...
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {user.is_teacher ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-600">Professor</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {user.is_musician ? "✅" : "❌"}
              </div>
              <div className="text-sm text-gray-600">Músico</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

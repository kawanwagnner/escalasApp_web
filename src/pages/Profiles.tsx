import React, { useEffect, useState } from "react";
import { Profile } from "../types";
import { Users, Music, BookOpen, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button, Card } from "../components/ui";
import { Layout } from "../components/layout";
import { profileService } from "../services";

export const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "teacher" | "musician">("all");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profileService.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === "teacher") return profile.is_teacher;
    if (filter === "musician") return profile.is_musician;
    return true;
  });

  if (loading) {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfis</h1>
            <p className="text-gray-600 mt-1">
              Visualize todos os membros cadastrados
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "primary" : "secondary"}
              onClick={() => setFilter("all")}
            >
              Todos ({profiles.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "teacher" ? "primary" : "secondary"}
              onClick={() => setFilter("teacher")}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Professores ({profiles.filter((p) => p.is_teacher).length})
            </Button>
            <Button
              size="sm"
              variant={filter === "musician" ? "primary" : "secondary"}
              onClick={() => setFilter("musician")}
            >
              <Music className="h-4 w-4 mr-1" />
              Músicos ({profiles.filter((p) => p.is_musician).length})
            </Button>
          </div>
        </div>

        {filteredProfiles.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum perfil encontrado
              </h3>
              <p className="text-gray-600">
                Não há perfis cadastrados com este filtro
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} hover>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="h-16 w-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {profile.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        ID: {profile.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.is_teacher && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Professor
                      </span>
                    )}
                    {profile.is_musician && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        Músico
                      </span>
                    )}
                    {!profile.is_teacher && !profile.is_musician && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        Membro
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <p>
                      Cadastrado em{" "}
                      {format(new Date(profile.created_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Card */}
        <Card title="📊 Estatísticas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {profiles.length}
              </div>
              <div className="text-sm text-gray-600">Total de Membros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {profiles.filter((p) => p.is_teacher).length}
              </div>
              <div className="text-sm text-gray-600">Professores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {profiles.filter((p) => p.is_musician).length}
              </div>
              <div className="text-sm text-gray-600">Músicos</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

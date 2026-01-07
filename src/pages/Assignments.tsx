import React, { useEffect, useState } from "react";
import { Clock, Calendar, User, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { Assignment } from "../types";
import { assignmentService } from "../services";
import { Layout } from "../components/layout";
import { Button, Card } from "../components/ui";

export const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      const data = await assignmentService.getMyAssignments(user!.id);
      setAssignments(data);
    } catch (error) {
      console.error("Erro ao carregar atribuições:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (id: string) => {
    if (!confirm("Deseja realmente remover esta atribuição?")) return;
    try {
      await assignmentService.unassignFromSlot(id);
      loadAssignments();
    } catch (error) {
      console.error("Erro ao remover atribuição:", error);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Minhas Atribuições
          </h1>
          <p className="text-gray-600 mt-1">
            Veja todos os slots onde você está escalado
          </p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma atribuição encontrada
              </h3>
              <p className="text-gray-600">
                Você ainda não foi atribuído a nenhum slot
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id} hover>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {assignment.slot?.title || "Slot sem título"}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {assignment.slot?.description || "Sem descrição"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {assignment.slot?.date
                          ? format(
                              new Date(assignment.slot.date),
                              "dd 'de' MMMM 'de' yyyy",
                              {
                                locale: ptBR,
                              }
                            )
                          : "Data não definida"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {assignment.slot?.start_time} -{" "}
                        {assignment.slot?.end_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        Atribuído em{" "}
                        {format(
                          new Date(assignment.assigned_at),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.slot?.mode === "manual"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Modo:{" "}
                      {assignment.slot?.mode === "manual"
                        ? "Manual"
                        : "Automático"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleUnassign(assignment.id)}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover Atribuição
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { useMyAssignments } from "../hooks";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";

export const MinhasEscalas = () => {
  const { user } = useAuth();
  const { data: escalas = [], isLoading } = useMyAssignments(user?.id || "");

  const getStatusColor = (date: string) => {
    const escalaDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil(
      (escalaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "bg-gray-100 text-gray-600"; // Passado
    if (diffDays === 0) return "bg-red-100 text-red-700"; // Hoje
    if (diffDays <= 2) return "bg-yellow-100 text-yellow-700"; // Próximos 2 dias
    return "bg-green-100 text-green-700"; // Futuro
  };

  const getStatusText = (date: string) => {
    const escalaDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil(
      (escalaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "Concluída";
    if (diffDays === 0) return "Hoje!";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return format(escalaDate, "dd/MM");
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Escalas</h1>
          <p className="text-gray-600 mt-1">
            Veja todas as escalas em que você está participando
          </p>
        </div>

        {escalas.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Você não está em nenhuma escala
              </h3>
              <p className="text-gray-600">
                Quando você for escalado, suas escalas aparecerão aqui
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {escalas.map((escala) => {
              const slot = escala.slot;
              const schedule = (slot as any)?.schedule;
              const date = slot?.date || schedule?.date || "";

              return (
                <Card key={escala.id} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            date
                          )}`}
                        >
                          {getStatusText(date)}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {slot?.title || "Escala"}
                        </h3>
                      </div>

                      {schedule && (
                        <p className="text-blue-600 font-medium mb-2">
                          📍 {schedule.title}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(
                              new Date(date + "T00:00:00"),
                              "EEEE, dd 'de' MMMM",
                              {
                                locale: ptBR,
                              }
                            )}
                          </span>
                        )}
                        {slot?.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {slot.start_time} - {slot.end_time}
                          </span>
                        )}
                      </div>

                      {slot?.description && (
                        <p className="mt-2 text-gray-500 text-sm">
                          {slot.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        Confirmado
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

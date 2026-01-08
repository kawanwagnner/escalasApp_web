import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { useMyAssignments } from "../hooks";
import { Calendar, Clock, CheckCircle, ChevronDown, ChevronUp, MapPin, User, Info } from "lucide-react";
import { formatDate, formatShortDate, formatTime } from "../utils/dateHelpers";
import { useAuth } from "../context/AuthContext";

export const MinhasEscalas = () => {
  const { user } = useAuth();
  const { data: escalas = [], isLoading } = useMyAssignments(user?.id || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (date: string) => {
    if (!date) return "bg-gray-100 text-gray-600";
    const escalaDate = new Date(date);
    if (isNaN(escalaDate.getTime())) return "bg-gray-100 text-gray-600";
    
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
    if (!date) return "Sem data";
    const escalaDate = new Date(date);
    if (isNaN(escalaDate.getTime())) return "Sem data";
    
    const today = new Date();
    const diffDays = Math.ceil(
      (escalaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "Concluída";
    if (diffDays === 0) return "Hoje!";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return formatShortDate(escalaDate);
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
              const schedule = slot?.schedule;
              const date = slot?.date || schedule?.date || "";
              const title = slot?.title || schedule?.title || "Escala";
              const isExpanded = expandedId === escala.id;

              return (
                <Card 
                  key={escala.id} 
                  hover
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setExpandedId(isExpanded ? null : escala.id)}
                >
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
                          {title}
                        </h3>
                      </div>

                      {schedule && (
                        <p className="text-blue-600 font-medium mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {schedule.title}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {date && !isNaN(new Date(date).getTime()) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(date, "weekday")}
                          </span>
                        )}
                        {slot?.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          Confirmado
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Área expandida com mais detalhes */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            Detalhes da Escala
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Data:</span>
                              {date ? formatDate(date, "full") : "Não definida"}
                            </div>
                            
                            {slot?.start_time && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Horário:</span>
                                {formatTime(slot.start_time)} às {formatTime(slot.end_time)}
                              </div>
                            )}

                            {schedule && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Ministério:</span>
                                {schedule.title}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            Sua Participação
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Status: <span className="text-green-600 font-medium">Confirmado</span></span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Participante:</span>
                              {user?.full_name || "Você"}
                            </div>

                            {escala.assigned_at && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Escalado em:</span>
                                {formatDate(escala.assigned_at, "short")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {slot?.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Observações:</span> {slot.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, Bell, ChevronRight } from "lucide-react";
import { formatDate, formatTime } from "../utils/dateHelpers";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/layout";
import { Card } from "../components/ui";
import { useSchedules } from "../hooks/useSchedules";
import { useMyAssignments } from "../hooks/useAssignments";
import { useMyInvites } from "../hooks/useInvites";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: allSchedules = [], isLoading: loadingSchedules } =
    useSchedules();
  const { data: allAssignments = [], isLoading: loadingAssignments } =
    useMyAssignments(user?.id || "");
  const { data: allInvites = [], isLoading: loadingInvites } = useMyInvites(
    user?.email || ""
  );

  const schedules = allSchedules.slice(0, 5);
  const invites = allInvites.filter((i) => i.status === "pending");

  // Ordenar assignments pela data do slot e pegar os próximos 5
  const sortedAssignments = [...allAssignments]
    .map((assignment) => {
      const slot = assignment.slot;
      const schedule = slot?.schedule;
      // A data pode estar no slot ou no schedule
      const date = slot?.date || schedule?.date || "";
      const title = slot?.title || schedule?.title || "Escala";

      return { ...assignment, _date: date, _title: title };
    })
    .sort((a, b) => {
      if (!a._date) return 1;
      if (!b._date) return -1;
      return a._date.localeCompare(b._date);
    })
    .slice(0, 5);

  const isLoading = loadingSchedules || loadingAssignments || loadingInvites;

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.full_name?.split(" ")[0] || "Usuário"}! 👋
          </h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            hover
            className="border-l-4 border-blue-600 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate("/ministerios")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ministérios</p>
                <p className="text-3xl font-bold text-gray-900">
                  {allSchedules.length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </Card>

          <Card
            hover
            className="border-l-4 border-green-600 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate("/minhas-escalas")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Minhas Escalas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {allAssignments.length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </Card>

          <Card
            hover
            className="border-l-4 border-purple-600 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate("/convites")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Convites Pendentes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {invites.length}
                </p>
              </div>
              <Bell className="h-12 w-12 text-purple-600 opacity-80" />
            </div>
          </Card>

          <Card
            hover
            className="border-l-4 border-orange-600 cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate("/perfil")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tipo de Perfil</p>
                <p className="text-lg font-bold text-gray-900">
                  {user?.role === "admin" ? "👑 Admin" : "👤 Membro"}
                </p>
              </div>
              <Users className="h-12 w-12 text-orange-600 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Minhas Próximas Escalas */}
        <Card title="📅 Minhas Próximas Escalas">
          {sortedAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Você não está em nenhuma escala</p>
              <p className="text-sm text-gray-400 mt-1">
                Quando for escalado, suas escalas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAssignments.map((assignment) => {
                const slot = assignment.slot;
                const schedule = slot?.schedule;
                const date = assignment._date;
                const title = assignment._title;

                const escalaDate = date ? new Date(date + "T00:00:00") : null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = escalaDate ? escalaDate < today : false;
                const isToday = escalaDate
                  ? escalaDate.getTime() === today.getTime()
                  : false;

                return (
                  <div
                    key={assignment.id}
                    onClick={() => navigate("/minhas-escalas")}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer group ${
                      isPast
                        ? "bg-gray-100 opacity-60 hover:opacity-80"
                        : isToday
                        ? "bg-red-50 border border-red-200 hover:bg-red-100"
                        : "bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isPast
                            ? "bg-gray-200"
                            : isToday
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <Calendar
                          className={`h-6 w-6 ${
                            isPast
                              ? "text-gray-500"
                              : isToday
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {title}
                          </h4>
                          {isPast && (
                            <span className="px-2 py-0.5 bg-gray-300 text-gray-700 text-xs font-semibold rounded-full">
                              Passou
                            </span>
                          )}
                          {isToday && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
                              Hoje!
                            </span>
                          )}
                        </div>
                        {schedule && (
                          <p className="text-sm text-blue-600 truncate">
                            {schedule.title}
                          </p>
                        )}
                        {slot?.start_time && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatTime(slot.start_time)} -{" "}
                            {formatTime(slot.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            isPast
                              ? "text-gray-500"
                              : isToday
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {date ? formatDate(date, "monthDay") : "Sem data"}
                        </p>
                        {date && (
                          <p className="text-xs text-gray-400">
                            {formatDate(date, "weekday").split(",")[0]}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                );
              })}

              {allAssignments.length > 5 && (
                <button
                  onClick={() => navigate("/minhas-escalas")}
                  className="w-full text-center py-3 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Ver todas as {allAssignments.length} escalas →
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <Card title="🔔 Convites Pendentes">
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Novo convite para slot
                    </p>
                    <p className="text-sm text-gray-600">
                      Aguardando sua resposta
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    Pendente
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

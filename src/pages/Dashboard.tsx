import React, { useEffect, useState } from "react";

import { Calendar, Clock, Users, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { Assignment, Schedule, SlotInvite } from "../types";
import { assignmentService, inviteService, scheduleService } from "../services";
import { Layout } from "../components/layout";
import { Card } from "../components/ui";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [invites, setInvites] = useState<SlotInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [schedulesData, assignmentsData, invitesData] = await Promise.all([
        scheduleService.getAllSchedules(),
        user
          ? assignmentService.getMyAssignments(user.id)
          : Promise.resolve([]),
        user ? inviteService.getMyInvites(user.email) : Promise.resolve([]),
      ]);

      setSchedules(schedulesData.slice(0, 5));
      setAssignments(assignmentsData.slice(0, 5));
      setInvites(invitesData.filter((i: SlotInvite) => i.status === "pending"));
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover className="border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Escalas Ativas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {schedules.length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </Card>

          <Card hover className="border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Minhas Atribuições</p>
                <p className="text-3xl font-bold text-gray-900">
                  {assignments.length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </Card>

          <Card hover className="border-l-4 border-purple-600">
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

          <Card hover className="border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tipo de Perfil</p>
                <p className="text-lg font-bold text-gray-900">
                  {user?.is_teacher && "Professor"}
                  {user?.is_musician &&
                    (user?.is_teacher ? " / Músico" : "Músico")}
                  {!user?.is_teacher && !user?.is_musician && "Membro"}
                </p>
              </div>
              <Users className="h-12 w-12 text-orange-600 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Recent Schedules */}
        <Card title="📅 Próximas Escalas">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma escala cadastrada
            </p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {schedule.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {schedule.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {format(new Date(schedule.date), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
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

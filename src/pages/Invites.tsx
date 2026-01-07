import React, { useEffect, useState } from "react";
import { Bell, Check, X, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { SlotInvite } from "../types";
import { inviteService } from "../services";
import { Layout } from "../components/layout";
import { Button, Card } from "../components/ui";

export const Invites: React.FC = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<SlotInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    try {
      const data = await inviteService.getMyInvites(user!.email);
      setInvites(data);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await inviteService.acceptInvite(id, user!.id);
      loadInvites();
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm("Deseja realmente recusar este convite?")) return;
    try {
      await inviteService.declineInvite(id);
      loadInvites();
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
    };
    const labels = {
      pending: "Pendente",
      accepted: "Aceito",
      declined: "Recusado",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
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

  const pendingInvites = invites.filter((i) => i.status === "pending");
  const respondedInvites = invites.filter((i) => i.status !== "pending");

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Convites</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus convites para participar de slots
          </p>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-yellow-600" />
              Convites Pendentes ({pendingInvites.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvites.map((invite) => (
                <Card
                  key={invite.id}
                  hover
                  className="border-l-4 border-yellow-500"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Convite para Slot
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4" />
                          <span>{invite.email}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Recebido em{" "}
                          {format(
                            new Date(invite.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                            {
                              locale: ptBR,
                            }
                          )}
                        </p>
                      </div>
                      {getStatusBadge(invite.status)}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAccept(invite.id)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDecline(invite.id)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Responded Invites */}
        {respondedInvites.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Respostas ({respondedInvites.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {respondedInvites.map((invite) => (
                <Card key={invite.id} hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Convite para Slot
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4" />
                          <span>{invite.email}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Recebido em{" "}
                          {format(
                            new Date(invite.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                            {
                              locale: ptBR,
                            }
                          )}
                        </p>
                        {invite.accepted_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Respondido em{" "}
                            {format(
                              new Date(invite.accepted_at),
                              "dd/MM/yyyy 'às' HH:mm",
                              {
                                locale: ptBR,
                              }
                            )}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(invite.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {invites.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum convite encontrado
              </h3>
              <p className="text-gray-600">
                Você ainda não recebeu nenhum convite para slots
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Mail, Check, X, Clock, Calendar, Loader2 } from "lucide-react";
import { formatDate } from "../utils/dateHelpers";
import { showToast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import { useMyInvites, useAcceptInvite, useDeclineInvite } from "../hooks";

export default function Convites() {
  const { user } = useAuth();
  const { data: convites = [], isLoading } = useMyInvites(user?.email || "");
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<
    "accept" | "decline" | null
  >(null);

  const handleAccept = async (conviteId: string) => {
    if (processingInvite) return;
    setProcessingInvite(conviteId);
    setProcessingAction("accept");
    try {
      await acceptInvite.mutateAsync({ id: conviteId, userId: user!.id });
      showToast.success("Convite aceito! Você foi adicionado à escala.");
    } catch (error: any) {
      console.error("Erro ao aceitar convite:", error);
      // Verificar se é um erro de conflito de escala
      const errorMessage = error?.message || "";
      if (
        errorMessage.includes("escalado") ||
        errorMessage.includes("mesmo dia")
      ) {
        showToast.error(errorMessage);
      } else {
        showToast.error("Erro ao aceitar convite. Tente novamente.");
      }
    } finally {
      setProcessingInvite(null);
      setProcessingAction(null);
    }
  };

  const handleDecline = async (conviteId: string) => {
    if (processingInvite) return;
    setProcessingInvite(conviteId);
    setProcessingAction("decline");
    try {
      await declineInvite.mutateAsync(conviteId);
      showToast.info("Convite recusado.");
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
      showToast.error("Erro ao recusar convite. Tente novamente.");
    } finally {
      setProcessingInvite(null);
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        );
      case "accepted":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <Check className="h-3 w-3" />
            Aceito
          </span>
        );
      case "declined":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <X className="h-3 w-3" />
            Recusado
          </span>
        );
      default:
        return null;
    }
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

  const pendentes = convites.filter((c) => c.status === "pending");
  const respondidos = convites.filter((c) => c.status !== "pending");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Convites</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus convites para participar de escalas
          </p>
        </div>

        {/* Convites Pendentes */}
        {pendentes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pendentes ({pendentes.length})
            </h2>
            <div className="space-y-4">
              {pendentes.map((convite) => (
                <Card
                  key={convite.id}
                  className="border-l-4 border-l-yellow-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(convite.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {convite.slot?.title || "Convite para escala"}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {convite.slot?.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {convite.slot.start_time} - {convite.slot.end_time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(convite.created_at, "short")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(convite.id)}
                        disabled={processingInvite === convite.id}
                        className="flex items-center gap-1"
                      >
                        {processingInvite === convite.id &&
                        processingAction === "accept" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Aceitar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDecline(convite.id)}
                        disabled={processingInvite === convite.id}
                        className="flex items-center gap-1"
                      >
                        {processingInvite === convite.id &&
                        processingAction === "decline" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Recusando...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Recusar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Convites Respondidos */}
        {respondidos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Histórico ({respondidos.length})
            </h2>
            <div className="space-y-3">
              {respondidos.map((convite) => (
                <Card key={convite.id} className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(convite.status)}
                      <span className="text-gray-700">
                        {convite.slot?.title || "Convite para escala"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(convite.created_at, "short")}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {convites.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum convite
              </h3>
              <p className="text-gray-600">
                Quando você receber convites para escalas, eles aparecerão aqui
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

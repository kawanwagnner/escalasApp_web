import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { slotService } from "../services/slot.service";
import { assignmentService } from "../services/assignment.service";
import type { Schedule, Slot } from "../types";
import { Plus, Trash2, Eye, Users, Clock, Calendar, Music, ChevronDown, ChevronUp, Info, Bell } from "lucide-react";
import { MemberAutocomplete } from "../components/ui/MemberAutocomplete";
import { formatDate, formatTime } from "../utils/dateHelpers";
import { useAuth } from "../context/AuthContext";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
} from "../hooks/useSchedules";
import {
  useSlotsBySchedule,
  useCreateSlot,
  useDeleteSlot,
} from "../hooks/useSlots";
import { useProfiles } from "../hooks/useProfiles";

export const Ministerios = () => {
  const { user } = useAuth();
  const { data: ministerios = [], isLoading } = useSchedules();
  const { data: membros = [] } = useProfiles();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const createSlot = useCreateSlot();
  const deleteSlot = useDeleteSlot();

  const [showModal, setShowModal] = useState(false);
  const [showEscalasModal, setShowEscalasModal] = useState(false);
  const [showNovaEscalaModal, setShowNovaEscalaModal] = useState(false);
  const [selectedMinisterio, setSelectedMinisterio] = useState<Schedule | null>(
    null
  );
  const [escalas, setEscalas] = useState<Slot[]>([]);
  const [expandedMinisterioId, setExpandedMinisterioId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    notify_24h: true,
    notify_48h: true,
    notify_48h_musician: true,
  });
  const [escalaFormData, setEscalaFormData] = useState({
    title: "",
    description: "",
    start_time: "19:00",
    end_time: "21:00",
    mode: "manual" as "manual" | "automatic",
    capacity: 5,
  });

  const loadEscalas = async (ministerioId: string) => {
    try {
      const data = await slotService.getSlotsBySchedule(ministerioId);
      setEscalas(data);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    }
  };

  const handleCreateMinisterio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSchedule.mutateAsync({
        ...formData,
        created_by: user!.id,
      });
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        notify_24h: true,
        notify_48h: true,
        notify_48h_musician: true,
      });
    } catch (error) {
      console.error("Erro ao criar ministério:", error);
    }
  };

  const handleCreateEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinisterio) return;

    try {
      await createSlot.mutateAsync({
        schedule_id: selectedMinisterio.id,
        theme_id: "",
        ...escalaFormData,
        date: selectedMinisterio.date,
      });
      setShowNovaEscalaModal(false);
      setEscalaFormData({
        title: "",
        description: "",
        start_time: "19:00",
        end_time: "21:00",
        mode: "manual",
        capacity: 5,
      });
      loadEscalas(selectedMinisterio.id);
    } catch (error) {
      console.error("Erro ao criar escala:", error);
    }
  };

  const handleDeleteMinisterio = async (id: string) => {
    if (!confirm("Deseja realmente deletar este ministério?")) return;
    try {
      await deleteSchedule.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao deletar ministério:", error);
    }
  };

  const handleDeleteEscala = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta escala?")) return;
    try {
      await deleteSlot.mutateAsync(id);
      if (selectedMinisterio) {
        loadEscalas(selectedMinisterio.id);
      }
    } catch (error) {
      console.error("Erro ao deletar escala:", error);
    }
  };

  const handleAssignMember = async (slotId: string, userId: string) => {
    try {
      await assignmentService.assignToSlot({
        slot_id: slotId,
        user_id: userId,
        assigned_by: user!.id,
      });
      if (selectedMinisterio) {
        loadEscalas(selectedMinisterio.id);
      }
    } catch (error) {
      console.error("Erro ao escalar membro:", error);
    }
  };

  const viewEscalas = async (ministerio: Schedule) => {
    setSelectedMinisterio(ministerio);
    await loadEscalas(ministerio.id);
    setShowEscalasModal(true);
  };

  const getMinisterioIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("louvor") || lower.includes("música")) return "🎵";
    if (lower.includes("mídia") || lower.includes("midia")) return "📹";
    if (lower.includes("infantil") || lower.includes("criança")) return "👶";
    if (lower.includes("jovem") || lower.includes("juventude")) return "🙌";
    if (lower.includes("recepcao") || lower.includes("recepção")) return "🤝";
    return "⛪";
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
            <h1 className="text-3xl font-bold text-gray-900">Ministérios</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os ministérios e suas escalas
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Novo Ministério
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministerios.map((ministerio) => {
            const isExpanded = expandedMinisterioId === ministerio.id;
            
            return (
              <Card 
                key={ministerio.id} 
                hover
                className="cursor-pointer"
                onClick={() => setExpandedMinisterioId(isExpanded ? null : ministerio.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {getMinisterioIcon(ministerio.title)}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {ministerio.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {ministerio.description || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatDate(ministerio.date, "long")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ministerio.notify_24h && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        🔔 24h
                      </span>
                    )}
                    {ministerio.notify_48h && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        🔔 48h
                      </span>
                    )}
                  </div>

                  {/* Área expandida com detalhes */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Detalhes do Ministério
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Data Base:</span>
                            {formatDate(ministerio.date, "full")}
                          </div>
                          
                          {ministerio.description && (
                            <div className="flex items-start gap-2 text-gray-600">
                              <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                              <span className="font-medium">Descrição:</span>
                              {ministerio.description}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-gray-600">
                            <Bell className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Notificações:</span>
                            <span className="flex gap-1">
                              {ministerio.notify_24h && <span className="text-blue-600">24h</span>}
                              {ministerio.notify_24h && ministerio.notify_48h && <span>,</span>}
                              {ministerio.notify_48h && <span className="text-purple-600">48h</span>}
                              {!ministerio.notify_24h && !ministerio.notify_48h && <span className="text-gray-400">Nenhuma</span>}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Criado em:</span>
                            {formatDate(ministerio.created_at, "short")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div 
                    className="flex gap-2 pt-3 border-t border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewEscalas(ministerio)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Escalas
                    </Button>
                    {user?.role === 'admin' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteMinisterio(ministerio.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {ministerios.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ministério cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando seu primeiro ministério (ex: Louvor, Mídia)
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Ministério
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Modal Novo Ministério */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Ministério"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMinisterio}>Criar Ministério</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Nome do Ministério"
            placeholder="Ex: Louvor, Mídia, Recepção..."
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Input
            label="Descrição"
            placeholder="Descrição do ministério..."
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Input
            type="date"
            label="Data Base"
            value={formData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
          />
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notify_24h}
                onChange={(e) =>
                  setFormData({ ...formData, notify_24h: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Notificar 24h antes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notify_48h}
                onChange={(e) =>
                  setFormData({ ...formData, notify_48h: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Notificar 48h antes</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Escalas do Ministério */}
      <Modal
        isOpen={showEscalasModal}
        onClose={() => setShowEscalasModal(false)}
        title={`Escalas - ${selectedMinisterio?.title}`}
      >  
        <div className="space-y-4">
          {user?.role === 'admin' && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowNovaEscalaModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Escala
              </Button>
            </div>
          )}

          {escalas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Nenhuma escala cadastrada para este ministério
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {escalas.map((escala) => (
                <div
                  key={escala.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Header da Escala */}
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {escala.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(escala.start_time)} - {formatTime(escala.end_time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            escala.mode === "manual"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {escala.mode === "manual" ? "Manual" : "Automático"}
                        </span>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteEscala(escala.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corpo da Escala */}
                  <div className="p-4">
                    {/* Descrição com links clicáveis */}
                    {escala.description && (
                      <p 
                        className="text-sm text-gray-600 mb-4 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: escala.description.replace(
                            /(https?:\/\/[^\s]+)/g,
                            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">$1</a>'
                          )
                        }}
                      />
                    )}

                    {/* Info de vagas */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {(escala as any).assignments?.length || 0} / {escala.capacity} vagas
                        </span>
                      </div>
                    </div>

                    {/* Escalados */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Membros Escalados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(escala as any).assignments?.length > 0 ? (
                          (escala as any).assignments?.map((assignment: any) => (
                            <div
                              key={assignment.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-full"
                            >
                              <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                                {assignment.user?.full_name?.charAt(0)?.toUpperCase()}
                              </div>
                              {assignment.user?.full_name}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Nenhum membro escalado ainda
                          </p>
                        )}
                      </div>

                      {/* Autocomplete para escalar membro - só admin */}
                      {user?.role === 'admin' && (
                        <div className="mt-3">
                          <MemberAutocomplete
                            members={membros}
                            excludeIds={(escala as any).assignments?.map((a: any) => a.user_id) || []}
                            onSelect={(member) => handleAssignMember(escala.id, member.id)}
                            placeholder="Buscar membro por nome ou email..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Nova Escala */}
      <Modal
        isOpen={showNovaEscalaModal}
        onClose={() => setShowNovaEscalaModal(false)}
        title="Nova Escala"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowNovaEscalaModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateEscala}>Criar Escala</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Título da Escala"
            placeholder="Ex: Domingo Manhã, Quarta-feira..."
            value={escalaFormData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEscalaFormData({ ...escalaFormData, title: e.target.value })
            }
            required
          />
          <Input
            label="Descrição"
            placeholder="Detalhes da escala..."
            value={escalaFormData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEscalaFormData({
                ...escalaFormData,
                description: e.target.value,
              })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Horário Início"
              value={escalaFormData.start_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEscalaFormData({
                  ...escalaFormData,
                  start_time: e.target.value,
                })
              }
              required
            />
            <Input
              type="time"
              label="Horário Fim"
              value={escalaFormData.end_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEscalaFormData({
                  ...escalaFormData,
                  end_time: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Capacidade"
              value={escalaFormData.capacity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEscalaFormData({
                  ...escalaFormData,
                  capacity: parseInt(e.target.value),
                })
              }
              min={1}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={escalaFormData.mode}
                onChange={(e) =>
                  setEscalaFormData({
                    ...escalaFormData,
                    mode: e.target.value as "manual" | "automatic",
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automático</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Ministerios;

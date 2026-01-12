import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { RichTextarea } from "../components/ui/RichTextarea";
import {
  SetlistForm,
  setlistToDescription,
  descriptionToSetlist,
  SetlistDisplay,
  isSetlistDescription,
} from "../components/ui";
import type { SetlistData } from "../components/ui";
import { slotService } from "../services/slot.service";
import { assignmentService } from "../services/assignment.service";
import type { Schedule, Slot } from "../types";
import {
  Plus,
  Trash2,
  Users,
  Clock,
  Calendar,
  Music,
  Pencil,
  FileText,
  ListMusic,
} from "lucide-react";
import { MemberAutocomplete } from "../components/ui/MemberAutocomplete";
import { formatDate, formatTime } from "../utils/dateHelpers";
import { showToast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "../hooks/useSchedules";
import {
  useSlotsBySchedule,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
} from "../hooks/useSlots";
import { useProfiles } from "../hooks/useProfiles";
import { useCreateInvite, useDeleteInvite } from "../hooks/useInvites";

export const Ministerios = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: ministerios = [], isLoading } = useSchedules();
  const { data: membros = [] } = useProfiles();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();
  const deleteSlot = useDeleteSlot();
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();

  const [showModal, setShowModal] = useState(false);
  const [showEditMinisterioModal, setShowEditMinisterioModal] = useState(false);
  const [editingMinisterio, setEditingMinisterio] = useState<Schedule | null>(
    null
  );
  const [showEscalasModal, setShowEscalasModal] = useState(false);
  const [showNovaEscalaModal, setShowNovaEscalaModal] = useState(false);
  const [showEditEscalaModal, setShowEditEscalaModal] = useState(false);
  const [editingEscala, setEditingEscala] = useState<Slot | null>(null);
  const [selectedMinisterio, setSelectedMinisterio] = useState<Schedule | null>(
    null
  );
  const [escalas, setEscalas] = useState<Slot[]>([]);
  const [loadingEscalas, setLoadingEscalas] = useState(false);
  const [invitingMember, setInvitingMember] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    notify_24h: true,
    notify_48h: true,
    notify_48h_musician: true,
  });
  const [editFormData, setEditFormData] = useState({
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
    mode: "manual" as "manual" | "livre",
    capacity: 5,
  });

  // Estado para controlar o modo de criação da descrição (apenas para Louvor)
  const [descriptionMode, setDescriptionMode] = useState<"livre" | "setlist">(
    "livre"
  );
  const [setlistData, setSetlistData] = useState<SetlistData>({
    title: "",
    songs: [],
    notes: "",
    playlistUrl: "",
  });

  // Função para verificar se é ministério de Louvor
  const isLouvorMinisterio = (ministerio: Schedule | null): boolean => {
    if (!ministerio) return false;
    const title = ministerio.title.toLowerCase();
    return (
      title.includes("louvor") ||
      title.includes("música") ||
      title.includes("musica") ||
      title.includes("worship")
    );
  };

  const loadEscalas = async (ministerioId: string) => {
    setLoadingEscalas(true);
    try {
      const data = await slotService.getSlotsBySchedule(ministerioId);
      setEscalas(data);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    } finally {
      setLoadingEscalas(false);
    }
  };

  // Efeito para abrir ministério via parâmetro da URL
  useEffect(() => {
    const scheduleId = searchParams.get("schedule");
    if (scheduleId && ministerios.length > 0 && !showEscalasModal) {
      const ministerio = ministerios.find((m) => m.id === scheduleId);
      if (ministerio) {
        setSelectedMinisterio(ministerio);
        setShowEscalasModal(true);
        loadEscalas(ministerio.id);
        // Limpa o parâmetro da URL após abrir
        setSearchParams({});
      }
    }
  }, [searchParams, ministerios, showEscalasModal]);

  const handleOpenEditMinisterio = (ministerio: Schedule) => {
    setEditingMinisterio(ministerio);
    setEditFormData({
      title: ministerio.title || "",
      description: ministerio.description || "",
      date: ministerio.date || "",
      notify_24h: ministerio.notify_24h ?? true,
      notify_48h: ministerio.notify_48h ?? true,
      notify_48h_musician: ministerio.notify_48h_musician ?? true,
    });
    setShowEditMinisterioModal(true);
  };

  const handleUpdateMinisterio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinisterio) return;

    if (!editFormData.title.trim()) {
      showToast.error("O nome do ministério é obrigatório");
      return;
    }

    try {
      await updateSchedule.mutateAsync({
        id: editingMinisterio.id,
        data: {
          title: editFormData.title,
          description: editFormData.description,
          date: editFormData.date,
          notify_24h: editFormData.notify_24h,
          notify_48h: editFormData.notify_48h,
          notify_48h_musician: editFormData.notify_48h_musician,
        },
      });
      setShowEditMinisterioModal(false);
      setEditingMinisterio(null);
      showToast.success("Ministério atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar ministério:", error);
      showToast.error("Erro ao atualizar ministério");
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

    // Validação do título obrigatório
    if (!escalaFormData.title.trim()) {
      showToast.error("O título da escala é obrigatório");
      return;
    }

    // Determina a descrição baseada no modo
    let finalDescription = escalaFormData.description;
    if (
      isLouvorMinisterio(selectedMinisterio) &&
      descriptionMode === "setlist"
    ) {
      if (!setlistData.title.trim()) {
        showToast.error("O título do setlist é obrigatório");
        return;
      }
      if (setlistData.songs.length === 0) {
        showToast.error("Adicione pelo menos uma música ao setlist");
        return;
      }
      if (setlistData.songs.some((s) => !s.title.trim())) {
        showToast.error("Todas as músicas devem ter um título");
        return;
      }
      finalDescription = setlistToDescription(setlistData);
    }

    try {
      // Combina a data do ministério com os horários para criar timestamps completos
      const baseDate =
        selectedMinisterio.date || new Date().toISOString().split("T")[0];
      const startTimestamp = `${baseDate}T${escalaFormData.start_time}:00`;
      const endTimestamp = `${baseDate}T${escalaFormData.end_time}:00`;

      await createSlot.mutateAsync({
        schedule_id: selectedMinisterio.id,
        title: escalaFormData.title,
        description: finalDescription,
        start_time: startTimestamp,
        end_time: endTimestamp,
        mode: escalaFormData.mode,
        capacity: escalaFormData.capacity,
        date: baseDate,
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
      // Reset setlist data
      setSetlistData({
        title: "",
        songs: [],
        notes: "",
        playlistUrl: "",
      });
      setDescriptionMode("livre");
      loadEscalas(selectedMinisterio.id);
    } catch (error) {
      console.error("Erro ao criar escala:", error);
    }
  };

  const handleOpenEditEscala = (escala: Slot) => {
    setEditingEscala(escala);
    // Extrai hora do timestamp (formato: 2026-01-12T19:00:00)
    const startTime = escala.start_time
      ? formatTime(escala.start_time)
      : "19:00";
    const endTime = escala.end_time ? formatTime(escala.end_time) : "21:00";

    setEscalaFormData({
      title: escala.title || "",
      description: escala.description || "",
      start_time: startTime,
      end_time: endTime,
      mode: escala.mode || "manual",
      capacity: escala.capacity || 5,
    });

    // Se for ministério de Louvor, tenta parsear a descrição como setlist
    if (isLouvorMinisterio(selectedMinisterio) && escala.description) {
      const parsedSetlist = descriptionToSetlist(escala.description);
      if (parsedSetlist && parsedSetlist.songs.length > 0) {
        setDescriptionMode("setlist");
        setSetlistData(parsedSetlist);
      } else {
        setDescriptionMode("livre");
        setSetlistData({ title: "", songs: [], notes: "", playlistUrl: "" });
      }
    } else {
      setDescriptionMode("livre");
      setSetlistData({ title: "", songs: [], notes: "", playlistUrl: "" });
    }

    setShowEditEscalaModal(true);
  };

  const handleUpdateEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEscala || !selectedMinisterio) return;

    if (!escalaFormData.title.trim()) {
      showToast.error("O título da escala é obrigatório");
      return;
    }

    // Determina a descrição baseada no modo
    let finalDescription = escalaFormData.description;
    if (
      isLouvorMinisterio(selectedMinisterio) &&
      descriptionMode === "setlist"
    ) {
      if (!setlistData.title.trim()) {
        showToast.error("O título do setlist é obrigatório");
        return;
      }
      if (setlistData.songs.length === 0) {
        showToast.error("Adicione pelo menos uma música ao setlist");
        return;
      }
      if (setlistData.songs.some((s) => !s.title.trim())) {
        showToast.error("Todas as músicas devem ter um título");
        return;
      }
      finalDescription = setlistToDescription(setlistData);
    }

    try {
      const baseDate =
        selectedMinisterio.date || new Date().toISOString().split("T")[0];
      const startTimestamp = `${baseDate}T${escalaFormData.start_time}:00`;
      const endTimestamp = `${baseDate}T${escalaFormData.end_time}:00`;

      await updateSlot.mutateAsync({
        id: editingEscala.id,
        data: {
          title: escalaFormData.title,
          description: finalDescription,
          start_time: startTimestamp,
          end_time: endTimestamp,
          mode: escalaFormData.mode,
          capacity: escalaFormData.capacity,
        },
      });

      setShowEditEscalaModal(false);
      setEditingEscala(null);
      setEscalaFormData({
        title: "",
        description: "",
        start_time: "19:00",
        end_time: "21:00",
        mode: "manual",
        capacity: 5,
      });
      // Reset setlist data
      setSetlistData({
        title: "",
        songs: [],
        notes: "",
        playlistUrl: "",
      });
      setDescriptionMode("livre");
      loadEscalas(selectedMinisterio.id);
      showToast.success("Escala atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar escala:", error);
      showToast.error("Erro ao atualizar escala");
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

  const handleInviteMember = async (slotId: string, memberEmail: string) => {
    if (invitingMember) return;
    setInvitingMember(true);
    try {
      await createInvite.mutateAsync({
        slot_id: slotId,
        email: memberEmail,
      });
      showToast.success("Convite enviado com sucesso!");
      if (selectedMinisterio) {
        await loadEscalas(selectedMinisterio.id);
      }
    } catch (error: any) {
      console.error("Erro ao convidar membro:", error);
      const errorMsg =
        error.response?.data?.message || error.response?.data?.msg || "";

      if (errorMsg.includes("unique") || errorMsg.includes("duplicate")) {
        showToast.error(
          "Este membro já possui um convite pendente ou já está na escala."
        );
      } else {
        showToast.error("Erro ao enviar convite. Tente novamente.");
      }
    } finally {
      setInvitingMember(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await assignmentService.unassignFromSlot(assignmentId);
      if (selectedMinisterio) {
        loadEscalas(selectedMinisterio.id);
      }
      showToast.success("Inscrição removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      showToast.error("Erro ao remover inscrição");
    }
  };

  const handleSelfAssign = async (slotId: string) => {
    if (!user) return;
    try {
      await assignmentService.assignToSlot({
        slot_id: slotId,
        user_id: user.id,
        assigned_by: user.id,
      });
      if (selectedMinisterio) {
        loadEscalas(selectedMinisterio.id);
      }
      showToast.success("Inscrição realizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao se inscrever:", error);
      const errorMsg =
        error.response?.data?.message || error.response?.data?.msg || "";
      if (errorMsg.includes("unique") || errorMsg.includes("duplicate")) {
        showToast.error("Você já está inscrito nesta escala.");
      } else {
        showToast.error("Erro ao se inscrever. Tente novamente.");
      }
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    try {
      await deleteInvite.mutateAsync(inviteId);
      if (selectedMinisterio) {
        await loadEscalas(selectedMinisterio.id);
      }
    } catch (error) {
      console.error("Erro ao remover convite:", error);
    }
  };

  const viewEscalas = (ministerio: Schedule) => {
    setSelectedMinisterio(ministerio);
    setEscalas([]); // Limpa escalas anteriores
    setShowEscalasModal(true); // Abre o modal imediatamente
    loadEscalas(ministerio.id); // Carrega em background
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

  // Skeleton para os cards de ministérios
  const MinisterioSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="pt-3 border-t border-gray-200">
          <div className="h-3 bg-gray-200 rounded w-36"></div>
        </div>
      </div>
    </div>
  );

  // Skeleton para as escalas no modal
  const EscalaSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-28"></div>
            <div className="h-8 bg-gray-200 rounded-full w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MinisterioSkeleton />
            <MinisterioSkeleton />
            <MinisterioSkeleton />
          </div>
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
          {user?.role === "admin" && (
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
          {ministerios.map((ministerio) => (
            <Card
              key={ministerio.id}
              hover
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => viewEscalas(ministerio)}
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
                </div>

                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Criado em: {formatDate(ministerio.created_at, "long")}
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

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-400 italic">
                    {"=>"} Clique para ver detalhes
                  </span>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditMinisterio(ministerio);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMinisterio(ministerio.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
              {user?.role === "admin" && (
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

      {/* Modal Editar Ministério */}
      <Modal
        isOpen={showEditMinisterioModal}
        onClose={() => {
          setShowEditMinisterioModal(false);
          setEditingMinisterio(null);
        }}
        title="Editar Ministério"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditMinisterioModal(false);
                setEditingMinisterio(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateMinisterio}>Salvar Alterações</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Nome do Ministério"
            placeholder="Ex: Louvor, Mídia, Recepção..."
            value={editFormData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, title: e.target.value })
            }
            required
          />
          <Input
            label="Descrição"
            placeholder="Descrição do ministério..."
            value={editFormData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, description: e.target.value })
            }
          />
          <Input
            type="date"
            label="Data Base"
            value={editFormData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, date: e.target.value })
            }
            required
          />
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editFormData.notify_24h}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    notify_24h: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="text-sm">Notificar 24h antes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editFormData.notify_48h}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    notify_48h: e.target.checked,
                  })
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
          {user?.role === "admin" && (
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

          {loadingEscalas ? (
            <div className="space-y-4">
              <EscalaSkeleton />
              <EscalaSkeleton />
            </div>
          ) : escalas.length === 0 ? (
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
                            <span>
                              {formatTime(escala.start_time)} -{" "}
                              {formatTime(escala.end_time)}
                            </span>
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
                          {escala.mode === "manual" ? "Manual" : "Livre"}
                        </span>
                        {user?.role === "admin" && (
                          <>
                            <button
                              onClick={() => handleOpenEditEscala(escala)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar escala"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEscala(escala.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar escala"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corpo da Escala */}
                  <div className="p-4">
                    {/* Descrição - usa SetlistDisplay para Louvor com setlist, ou markdown para outros */}
                    {escala.description &&
                      (isLouvorMinisterio(selectedMinisterio) &&
                      isSetlistDescription(escala.description) ? (
                        <div className="mb-4">
                          <SetlistDisplay description={escala.description} />
                        </div>
                      ) : (
                        <div
                          className="text-sm text-gray-600 mb-4 whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{
                            __html: escala.description
                              // Negrito: **texto** -> <strong>texto</strong>
                              .replace(
                                /\*\*(.+?)\*\*/g,
                                '<strong class="font-bold text-gray-800">$1</strong>'
                              )
                              // Itálico: _texto_ -> <em>texto</em>
                              .replace(
                                /(?<!\w)_(.+?)_(?!\w)/g,
                                '<em class="italic">$1</em>'
                              )
                              // Links: [texto](url) -> <a href="url">texto</a>
                              .replace(
                                /\[(.+?)\]\((.+?)\)/g,
                                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">$1</a>'
                              )
                              // URLs diretas
                              .replace(
                                /(?<!href=")(https?:\/\/[^\s<]+)/g,
                                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline break-all">$1</a>'
                              ),
                          }}
                        />
                      ))}

                    {/* Info de vagas - só conta confirmados */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {(escala as any).assignments?.length || 0} /{" "}
                          {escala.capacity}{" "}
                          {escala.mode === "livre"
                            ? (escala as any).assignments?.length === 1
                              ? "vaga preenchida"
                              : "vagas preenchidas"
                            : "vagas confirmadas"}
                        </span>
                      </div>
                      {escala.mode === "manual" &&
                        (escala as any).invites?.filter(
                          (i: any) => i.status === "pending"
                        )?.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">
                              {
                                (escala as any).invites?.filter(
                                  (i: any) => i.status === "pending"
                                )?.length
                              }{" "}
                              pendentes
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Membros Confirmados/Inscritos */}
                    <div className="space-y-3 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {escala.mode === "livre"
                          ? (escala as any).assignments?.length === 1
                            ? "Inscrito"
                            : "Inscritos"
                          : "Confirmados"}{" "}
                        ({(escala as any).assignments?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(escala as any).assignments?.length > 0 ? (
                          (escala as any).assignments?.map(
                            (assignment: any) => (
                              <div
                                key={assignment.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-full group"
                              >
                                <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-medium">
                                  {assignment.user?.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </div>
                                {assignment.user?.full_name}
                                <span className="text-green-600 text-xs">
                                  ✓
                                </span>
                                {/* Admin pode remover qualquer um */}
                                {user?.role === "admin" && (
                                  <button
                                    onClick={() =>
                                      handleRemoveAssignment(assignment.id)
                                    }
                                    className="ml-1 w-4 h-4 flex items-center justify-center text-green-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                    title="Remover membro"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            {escala.mode === "livre"
                              ? "Nenhum membro inscrito ainda"
                              : "Nenhum membro confirmado ainda"}
                          </p>
                        )}
                      </div>

                      {/* Botão para se inscrever OU cancelar inscrição em escala livre */}
                      {escala.mode === "livre" &&
                        (() => {
                          const myAssignment = (
                            escala as any
                          ).assignments?.find(
                            (a: any) => a.user_id === user?.id
                          );
                          const isInscrito = !!myAssignment;
                          const hasVagas =
                            ((escala as any).assignments?.length || 0) <
                            escala.capacity;

                          if (isInscrito) {
                            return (
                              <div className="flex justify-end">
                                <button
                                  onClick={() =>
                                    handleRemoveAssignment(myAssignment.id)
                                  }
                                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Cancelar minha inscrição
                                </button>
                              </div>
                            );
                          } else if (hasVagas) {
                            return (
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleSelfAssign(escala.id)}
                                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                  Inscrever-me
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()}
                    </div>

                    {/* Convites Pendentes - apenas para modo manual */}
                    {escala.mode === "manual" && (
                      <div className="space-y-3 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Pendentes (
                          {(escala as any).invites?.filter(
                            (i: any) => i.status === "pending"
                          )?.length || 0}
                          )
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(escala as any).invites?.filter(
                            (i: any) => i.status === "pending"
                          )?.length > 0 ? (
                            (escala as any).invites
                              ?.filter((i: any) => i.status === "pending")
                              ?.map((invite: any) => (
                                <div
                                  key={invite.id}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-full group"
                                >
                                  <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-medium">
                                    {invite.email?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <span className="max-w-[150px] truncate">
                                    {membros.find(
                                      (m) => m.email === invite.email
                                    )?.full_name || invite.email}
                                  </span>
                                  <span className="text-yellow-600 text-xs">
                                    ⏳
                                  </span>
                                  {user?.role === "admin" && (
                                    <button
                                      onClick={() =>
                                        handleRemoveInvite(invite.id)
                                      }
                                      className="ml-1 w-4 h-4 flex items-center justify-center text-yellow-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                      title="Cancelar convite"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Nenhum convite pendente
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Convites Recusados - apenas para admin e modo manual */}
                    {user?.role === "admin" &&
                      escala.mode === "manual" &&
                      (escala as any).invites?.filter(
                        (i: any) => i.status === "declined"
                      )?.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Recusados (
                            {
                              (escala as any).invites?.filter(
                                (i: any) => i.status === "declined"
                              )?.length
                            }
                            )
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(escala as any).invites
                              ?.filter((i: any) => i.status === "declined")
                              ?.map((invite: any) => (
                                <div
                                  key={invite.id}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-full opacity-60 group"
                                >
                                  <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center text-xs font-medium">
                                    {invite.email?.charAt(0)?.toUpperCase()}
                                  </div>
                                  {invite.email}
                                  <span className="text-red-600 text-xs">
                                    ✗
                                  </span>
                                  {user?.role === "admin" && (
                                    <button
                                      onClick={() =>
                                        handleRemoveInvite(invite.id)
                                      }
                                      className="ml-1 w-4 h-4 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors opacity-100"
                                      title="Remover recusa"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Autocomplete para convidar membro - só admin e modo manual */}
                    {user?.role === "admin" && escala.mode === "manual" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Convidar membro
                        </p>
                        <MemberAutocomplete
                          members={membros}
                          excludeIds={[
                            ...((escala as any).assignments?.map(
                              (a: any) => a.user_id
                            ) || []),
                            ...((escala as any).invites
                              ?.filter((i: any) => i.status === "pending")
                              ?.map(
                                (i: any) =>
                                  membros.find((m: any) => m.email === i.email)
                                    ?.id
                              )
                              .filter(Boolean) || []),
                          ]}
                          onSelect={(member) =>
                            handleInviteMember(escala.id, member.email)
                          }
                          placeholder="Buscar membro por nome ou email..."
                        />
                      </div>
                    )}
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
        onClose={() => {
          setShowNovaEscalaModal(false);
          setDescriptionMode("livre");
          setSetlistData({ title: "", songs: [], notes: "", playlistUrl: "" });
        }}
        title="Nova Escala"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNovaEscalaModal(false);
                setDescriptionMode("livre");
                setSetlistData({
                  title: "",
                  songs: [],
                  notes: "",
                  playlistUrl: "",
                });
              }}
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

          {/* Tabs para modo de descrição - apenas para Louvor */}
          {isLouvorMinisterio(selectedMinisterio) && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setDescriptionMode("livre")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    descriptionMode === "livre"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Livre
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionMode("setlist")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    descriptionMode === "setlist"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ListMusic className="h-4 w-4" />
                  Setlist
                </button>
              </div>
            </div>
          )}

          {/* Conteúdo baseado no modo */}
          {isLouvorMinisterio(selectedMinisterio) &&
          descriptionMode === "setlist" ? (
            <SetlistForm value={setlistData} onChange={setSetlistData} />
          ) : (
            <RichTextarea
              label={
                isLouvorMinisterio(selectedMinisterio) ? undefined : "Descrição"
              }
              placeholder="Detalhes da escala, links, instruções..."
              value={escalaFormData.description}
              onChange={(value) =>
                setEscalaFormData({
                  ...escalaFormData,
                  description: value,
                })
              }
              rows={4}
            />
          )}
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
                    mode: e.target.value as "manual" | "livre",
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="livre">Livre</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Escala */}
      <Modal
        isOpen={showEditEscalaModal}
        onClose={() => {
          setShowEditEscalaModal(false);
          setEditingEscala(null);
          setEscalaFormData({
            title: "",
            description: "",
            start_time: "19:00",
            end_time: "21:00",
            mode: "manual",
            capacity: 5,
          });
          setDescriptionMode("livre");
          setSetlistData({ title: "", songs: [], notes: "", playlistUrl: "" });
        }}
        title="Editar Escala"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditEscalaModal(false);
                setEditingEscala(null);
                setDescriptionMode("livre");
                setSetlistData({
                  title: "",
                  songs: [],
                  notes: "",
                  playlistUrl: "",
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateEscala}>Salvar Alterações</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Título da Escala *"
            placeholder="Ex: Domingo Manhã, Quarta-feira..."
            value={escalaFormData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEscalaFormData({ ...escalaFormData, title: e.target.value })
            }
            required
          />

          {/* Tabs para modo de descrição - apenas para Louvor */}
          {isLouvorMinisterio(selectedMinisterio) && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setDescriptionMode("livre")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    descriptionMode === "livre"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Livre
                </button>
                <button
                  type="button"
                  onClick={() => setDescriptionMode("setlist")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    descriptionMode === "setlist"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ListMusic className="h-4 w-4" />
                  Setlist
                </button>
              </div>
            </div>
          )}

          {/* Conteúdo baseado no modo */}
          {isLouvorMinisterio(selectedMinisterio) &&
          descriptionMode === "setlist" ? (
            <SetlistForm value={setlistData} onChange={setSetlistData} />
          ) : (
            <RichTextarea
              label={
                isLouvorMinisterio(selectedMinisterio) ? undefined : "Descrição"
              }
              placeholder="Detalhes da escala, links, instruções..."
              value={escalaFormData.description}
              onChange={(value) =>
                setEscalaFormData({
                  ...escalaFormData,
                  description: value,
                })
              }
              rows={4}
            />
          )}

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
                    mode: e.target.value as "manual" | "livre",
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="livre">Livre</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Ministerios;

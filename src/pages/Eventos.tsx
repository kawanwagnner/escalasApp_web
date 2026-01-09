import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../hooks";
import type { PublicEvent } from "../types";
import { formatDate } from "../utils/dateHelpers";
import { CalendarDays, Plus, Trash2, Edit, Loader2 } from "lucide-react";

export default function Eventos() {
  const { user } = useAuth();
  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PublicEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ title: "", description: "", date: "" });
    setShowModal(true);
  };

  const openEditModal = (event: PublicEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) return;

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: formData });
      } else {
        await createEvent.mutateAsync({
          ...formData,
          created_by: user?.id || "",
        });
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      await deleteEvent.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
    }
  };

  const formLoading = createEvent.isPending || updateEvent.isPending;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600">
              Gerencie os eventos públicos da igreja
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          )}
        </div>

        {/* Lista de Eventos */}
        {events.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Nenhum evento
              </h3>
              <p className="text-gray-500">
                Crie o primeiro evento clicando no botão acima.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const eventDate = new Date(event.date + "T00:00:00");
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastEvent = eventDate < today;

              return (
                <Card key={event.id} className={isPastEvent ? "opacity-60" : ""}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isPastEvent ? "bg-gray-100" : "bg-purple-100"
                        }`}>
                          <CalendarDays className={`w-6 h-6 ${
                            isPastEvent ? "text-gray-400" : "text-purple-600"
                          }`} />
                        </div>
                        {isPastEvent && (
                          <span className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                            Passou
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <p className={`text-sm font-medium ${
                        isPastEvent ? "text-gray-500" : "text-indigo-600"
                      }`}>
                        {formatDate(event.date, "weekday")}
                      </p>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingEvent ? "Editar Evento" : "Novo Evento"}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} isLoading={formLoading}>
                {editingEvent ? "Salvar" : "Criar Evento"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nome do evento"
            />
            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do evento (opcional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { scheduleService } from "../services/schedule.service";
import { slotService } from "../services/slot.service";
import { Schedule, Slot } from "../types";
import { Plus, Calendar, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";

export const Schedules: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    notify_24h: true,
    notify_48h: true,
    notify_48h_musician: true,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await scheduleService.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (scheduleId: string) => {
    try {
      const data = await slotService.getSlotsBySchedule(scheduleId);
      setSlots(data);
    } catch (error) {
      console.error("Erro ao carregar slots:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleService.createSchedule({
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
      loadSchedules();
    } catch (error) {
      console.error("Erro ao criar escala:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta escala?")) return;
    try {
      await scheduleService.deleteSchedule(id);
      loadSchedules();
    } catch (error) {
      console.error("Erro ao deletar escala:", error);
    }
  };

  const viewSlots = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    await loadSlots(schedule.id);
    setShowSlotsModal(true);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escalas</h1>
            <p className="text-gray-600 mt-1">Gerencie as escalas da igreja</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova Escala
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <Card key={schedule.id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {schedule.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {schedule.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {format(new Date(schedule.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {schedule.notify_24h && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      🔔 24h
                    </span>
                  )}
                  {schedule.notify_48h && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      🔔 48h
                    </span>
                  )}
                  {schedule.notify_48h_musician && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      🎵 Músicos
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => viewSlots(schedule)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Slots
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {schedules.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma escala cadastrada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira escala
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeira Escala
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Schedule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Escala"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar Escala</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Input
            type="date"
            label="Data"
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notify_48h_musician}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notify_48h_musician: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="text-sm">Notificar músicos 48h antes</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* View Slots Modal */}
      <Modal
        isOpen={showSlotsModal}
        onClose={() => setShowSlotsModal(false)}
        title={`Slots - ${selectedSchedule?.title}`}
      >
        <div className="space-y-3">
          {slots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum slot cadastrado para esta escala
            </p>
          ) : (
            slots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h4 className="font-semibold text-gray-900">{slot.title}</h4>
                <p className="text-sm text-gray-600">{slot.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-500">
                    ⏰ {slot.start_time} - {slot.end_time}
                  </span>
                  <span className="text-gray-500">
                    👥 Capacidade: {slot.capacity}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      slot.mode === "manual"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {slot.mode === "manual" ? "Manual" : "Automático"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </Layout>
  );
};

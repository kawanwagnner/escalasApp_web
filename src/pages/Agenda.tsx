import { useState, useMemo } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useEvents, useCreateEvent } from "../hooks";
import { useSchedules } from "../hooks/useSchedules";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/dateHelpers";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
} from "lucide-react";

export default function Agenda() {
  const { user } = useAuth();
  const { data: eventos = [] } = useEvents();
  const { data: ministerios = [] } = useSchedules();
  const createEvent = useCreateEvent();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showNovoEventoModal, setShowNovoEventoModal] = useState(false);
  const [eventoFormData, setEventoFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  const handleCreateEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createEvent.mutateAsync({
        ...eventoFormData,
        created_by: user.id,
      });
      setShowNovoEventoModal(false);
      setEventoFormData({
        title: "",
        description: "",
        date: "",
      });
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  const openNovoEventoModal = (prefilledDate?: string) => {
    setEventoFormData({
      title: "",
      description: "",
      date: prefilledDate || "",
    });
    setShowNovoEventoModal(true);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayEvents = eventos.filter((e) => e.date === dateStr);
    const dayMinisterios = ministerios.filter((m) => m.date === dateStr);

    return { eventos: dayEvents, ministerios: dayMinisterios };
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return checkDate < today;
  };

  // Eventos do mês atual
  const currentMonthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    return eventos
      .filter((e) => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [eventos, currentDate]);

  // Eventos e ministérios do dia selecionado
  const selectedDayData = useMemo(() => {
    if (selectedDay === null) return { eventos: [], ministerios: [] };
    return getEventsForDay(selectedDay);
  }, [selectedDay, eventos, ministerios, currentDate]);

  const selectedDateStr = selectedDay
    ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600 mt-1">
              Visualize todos os eventos e escalas no calendário
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={() => openNovoEventoModal(selectedDateStr || undefined)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Novo Evento
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <Card>
              {/* Header do calendário */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h2>
                  <Button size="sm" variant="ghost" onClick={goToToday}>
                    Hoje
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-24" />;
                  }

                  const { eventos: dayEvents, ministerios: dayMinisterios } =
                    getEventsForDay(day);
                  const hasEvents =
                    dayEvents.length > 0 || dayMinisterios.length > 0;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-24 p-1 border rounded-lg transition-colors cursor-pointer ${
                        selectedDay === day
                          ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500"
                          : isToday(day)
                          ? "bg-blue-50 border-blue-300 hover:border-blue-400"
                          : isPast(day)
                          ? "bg-gray-50 border-gray-200 hover:border-gray-300"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday(day)
                              ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                              : isPast(day)
                              ? "text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded truncate"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayMinisterios.slice(0, 2 - dayEvents.length).map((min) => (
                          <div
                            key={min.id}
                            className="text-xs px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded truncate"
                            title={min.title}
                          >
                            {min.title}
                          </div>
                        ))}
                        {hasEvents &&
                          dayEvents.length + dayMinisterios.length > 2 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dayEvents.length + dayMinisterios.length - 2}{" "}
                              mais
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-100 rounded" />
                  <span className="text-sm text-gray-600">Eventos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-100 rounded" />
                  <span className="text-sm text-gray-600">Ministérios</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de eventos do dia selecionado */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
                {selectedDay ? (
                  <>
                    {selectedDay} de {monthNames[currentDate.getMonth()]}
                  </>
                ) : (
                  <>Selecione um dia</>
                )}
              </h3>

              {!selectedDay ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Clique em um dia para ver os detalhes</p>
                </div>
              ) : selectedDayData.eventos.length === 0 && selectedDayData.ministerios.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Nenhum evento neste dia</p>
                  {user?.role === 'admin' && (
                    <Button 
                      size="sm" 
                      onClick={() => openNovoEventoModal(selectedDateStr || undefined)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Evento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Eventos do dia */}
                  {selectedDayData.eventos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Eventos ({selectedDayData.eventos.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedDayData.eventos.map((event) => {
                          const eventDate = new Date(event.date + "T00:00:00");
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isPastEvent = eventDate < today;

                          return (
                            <div
                              key={event.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                isPastEvent
                                  ? "bg-gray-50 border-l-gray-400 opacity-60"
                                  : "bg-indigo-50 border-l-indigo-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-gray-900">
                                  {event.title}
                                </h5>
                                {isPastEvent && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                                    Passou
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ministérios/Escalas do dia */}
                  {selectedDayData.ministerios.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Ministérios ({selectedDayData.ministerios.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedDayData.ministerios.map((min) => {
                          const minDate = new Date(min.date + "T00:00:00");
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isPastMin = minDate < today;

                          return (
                            <div
                              key={min.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                isPastMin
                                  ? "bg-gray-50 border-l-gray-400 opacity-60"
                                  : "bg-emerald-50 border-l-emerald-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-gray-900">
                                  {min.title}
                                </h5>
                                {isPastMin && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                                    Passou
                                  </span>
                                )}
                              </div>
                              {min.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {min.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Novo Evento */}
      <Modal
        isOpen={showNovoEventoModal}
        onClose={() => setShowNovoEventoModal(false)}
        title="Novo Evento"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNovoEventoModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEvento}
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? "Criando..." : "Criar Evento"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCreateEvento}>
          <Input
            label="Título do Evento"
            placeholder="Ex: Culto de Domingo, Ensaio..."
            value={eventoFormData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventoFormData({ ...eventoFormData, title: e.target.value })
            }
            required
          />
          <Input
            label="Descrição"
            placeholder="Descrição do evento..."
            value={eventoFormData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventoFormData({ ...eventoFormData, description: e.target.value })
            }
          />
          <Input
            type="date"
            label="Data"
            value={eventoFormData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEventoFormData({ ...eventoFormData, date: e.target.value })
            }
            required
          />
        </form>
      </Modal>
    </Layout>
  );
}

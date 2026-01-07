import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { announcementService } from "../services/announcement.service";
import { edgeFunctionService } from "../services/edgeFunction.service";
import type { Announcement } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Megaphone, Plus, Send, Loader2 } from "lucide-react";

export default function Comunicados() {
  const [comunicados, setComunicados] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadComunicados();
  }, []);

  const loadComunicados = async () => {
    try {
      const data = await announcementService.getAllAnnouncements();
      setComunicados(data);
    } catch (error) {
      console.error("Erro ao carregar comunicados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.message) return;
    setFormLoading(true);
    try {
      await announcementService.createAnnouncement(formData);
      setShowModal(false);
      setFormData({ title: "", message: "" });
      loadComunicados();
    } catch (error) {
      console.error("Erro ao criar comunicado:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendEmails = async (comunicadoId: string) => {
    setSending(comunicadoId);
    try {
      await edgeFunctionService.sendAnnouncementEmails(comunicadoId);
      alert("Emails enviados com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar emails:", error);
      alert("Erro ao enviar emails");
    } finally {
      setSending(null);
    }
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
            <p className="text-gray-600">Gerencie os comunicados da igreja</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Comunicado
          </Button>
        </div>

        {/* Lista de Comunicados */}
        {comunicados.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Nenhum comunicado
              </h3>
              <p className="text-gray-500">
                Crie o primeiro comunicado clicando no botão acima.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {comunicados.map((comunicado) => (
              <Card key={comunicado.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {comunicado.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(comunicado.created_at),
                            "dd 'de' MMMM 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-13 whitespace-pre-wrap">
                      {comunicado.message}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSendEmails(comunicado.id)}
                    disabled={sending === comunicado.id}
                  >
                    {sending === comunicado.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Criar */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Novo Comunicado"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} isLoading={formLoading}>
                Criar Comunicado
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
              placeholder="Título do comunicado"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Digite a mensagem do comunicado..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

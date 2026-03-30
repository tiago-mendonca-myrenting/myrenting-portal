import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  User,
  FileText,
  MessageSquare,
  FolderOpen,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
  Car,
  Calendar,
  Gauge,
  Euro
} from 'lucide-react';

const STATUS_DOCUMENTO = ['submetido', 'em_verificacao', 'aprovado', 'rejeitado', 'precisa_de_mais_info'];
const STATUS_GLOBAL = ['por_iniciar', 'a_aguardar_documentos', 'em_analise', 'a_aguardar_resposta_cliente', 'aprovado', 'rejeitado', 'concluido'];

const AdminClientDetail = () => {
  const { clientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [viaturaDialogOpen, setViaturaDialogOpen] = useState(false);
  const [viaturaData, setViaturaData] = useState({
    viatura_marca: '',
    viatura_modelo: '',
    viatura_versao: '',
    viatura_combustivel: '',
    viatura_cor: '',
    contrato_prazo: '',
    contrato_km_ano: '',
    contrato_mensalidade: '',
    contrato_entrada: ''
  });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [clientRes, templatesRes] = await Promise.all([
        api.get(`/admin/clients/${clientId}`),
        api.get('/admin/templates')
      ]);
      setClientData(clientRes.data);
      setTemplates(templatesRes.data.filter((t) => t.ativo));
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error('Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpdate = async () => {
    if (!selectedDoc) return;
    setSaving(true);
    try {
      await api.put(`/admin/documents/${selectedDoc.id}`, {
        estado_documento: selectedDoc.estado_documento,
        notas_admin: selectedDoc.notas_admin,
        notas_visiveis: selectedDoc.notas_visiveis
      });
      toast.success('Documento atualizado!');
      setDocDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar documento');
    } finally {
      setSaving(false);
    }
  };

  const handleCaseUpdate = async (caseId, updates) => {
    setSaving(true);
    try {
      await api.put(`/cases/${caseId}`, updates);
      toast.success('Processo atualizado!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar processo');
    } finally {
      setSaving(false);
    }
  };

  const handleViaturaUpdate = async (caseId) => {
    setSaving(true);
    try {
      await api.put(`/cases/${caseId}`, {
        viatura_marca: viaturaData.viatura_marca || null,
        viatura_modelo: viaturaData.viatura_modelo || null,
        viatura_versao: viaturaData.viatura_versao || null,
        viatura_combustivel: viaturaData.viatura_combustivel || null,
        viatura_cor: viaturaData.viatura_cor || null,
        contrato_prazo: viaturaData.contrato_prazo ? parseInt(viaturaData.contrato_prazo) : null,
        contrato_km_ano: viaturaData.contrato_km_ano ? parseInt(viaturaData.contrato_km_ano) : null,
        contrato_mensalidade: viaturaData.contrato_mensalidade ? parseFloat(viaturaData.contrato_mensalidade) : null,
        contrato_entrada: viaturaData.contrato_entrada ? parseFloat(viaturaData.contrato_entrada) : null
      });
      toast.success('Viatura e contrato atualizados!');
      setViaturaDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar viatura');
    } finally {
      setSaving(false);
    }
  };

  const openViaturaDialog = (caseItem) => {
    setViaturaData({
      viatura_marca: caseItem.viatura_marca || '',
      viatura_modelo: caseItem.viatura_modelo || '',
      viatura_versao: caseItem.viatura_versao || '',
      viatura_combustivel: caseItem.viatura_combustivel || '',
      viatura_cor: caseItem.viatura_cor || '',
      contrato_prazo: caseItem.contrato_prazo || '',
      contrato_km_ano: caseItem.contrato_km_ano || '',
      contrato_mensalidade: caseItem.contrato_mensalidade || '',
      contrato_entrada: caseItem.contrato_entrada || ''
    });
    setViaturaDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !clientData?.cases?.[0]) return;
    setSaving(true);
    try {
      await api.post('/messages', {
        case_id: clientData.cases[0].id,
        texto: messageText.trim(),
        template_id: selectedTemplate || null
      });
      toast.success('Mensagem enviada!');
      setMessageDialogOpen(false);
      setMessageText('');
      setSelectedTemplate('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      let text = template.corpo;
      text = text.replace('{nome_cliente}', clientData?.client?.name || '');
      setMessageText(text);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao descarregar documento');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
        </div>
      </Layout>
    );
  }

  if (!clientData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-500">Cliente não encontrado</p>
        </div>
      </Layout>
    );
  }

  const { client, profile, documents, cases } = clientData;

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-client-detail">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {client.name}
            </h1>
            <p className="text-slate-500">{client.email}</p>
          </div>
          <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2" data-testid="send-message-btn">
                <MessageSquare className="h-4 w-4" />
                Enviar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Mensagem ao Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template (opcional)</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    placeholder="Escreva a sua mensagem..."
                    data-testid="message-textarea"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={saving || !messageText.trim()}
                  className="w-full bg-[#224c57] hover:bg-[#224c57]/90 gap-2"
                  data-testid="confirm-send-message"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="viatura">Viatura & Contrato</TabsTrigger>
            <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
            <TabsTrigger value="cases">Processos ({cases.length})</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Nome</span>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">{client.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Telefone</span>
                    <span className="font-medium">{client.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">NIF</span>
                    <span className="font-medium">{client.nif || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Morada</span>
                    <span className="font-medium">{client.address || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#224c57]">
                    Perfil Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Tipo</span>
                    <span className="font-medium capitalize">{profile?.tipo_cliente || 'particular'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Tipo Habitação</span>
                    <span className="font-medium capitalize">{profile?.tipo_habitacao?.replace(/_/g, ' ') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Situação Profissional</span>
                    <span className="font-medium capitalize">{profile?.situacao_profissional?.replace(/_/g, ' ') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Profissão</span>
                    <span className="font-medium">{profile?.profissao || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Rendimentos</span>
                    <span className="font-medium">{profile?.rendimentos_mensais ? `${profile.rendimentos_mensais} €` : '-'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Viatura & Contrato Tab */}
          <TabsContent value="viatura">
            {cases.length === 0 ? (
              <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="py-12 text-center text-slate-400">
                  Nenhum processo para adicionar viatura
                </CardContent>
              </Card>
            ) : (
              cases.map((caseItem) => (
                <Card key={caseItem.id} className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl mb-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Viatura & Contrato - Processo #{caseItem.id.slice(0, 8)}
                    </CardTitle>
                    <Dialog open={viaturaDialogOpen} onOpenChange={setViaturaDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => openViaturaDialog(caseItem)}
                          data-testid="edit-viatura-btn"
                        >
                          <Car className="h-4 w-4" />
                          {caseItem.viatura_marca ? 'Editar Viatura' : 'Adicionar Viatura'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Viatura & Contrato</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                          <div className="p-3 bg-[#224c57]/5 rounded-lg mb-4">
                            <p className="text-sm text-[#224c57] font-medium">Preferências do Cliente:</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Interesse: {caseItem.carro_interesse || 'Não especificado'} | 
                              Orçamento: {caseItem.orcamento_mensal ? `${caseItem.orcamento_mensal}€/mês` : 'N/A'} | 
                              Prazo: {caseItem.prazo_meses ? `${caseItem.prazo_meses} meses` : 'N/A'} |
                              Km/ano: {caseItem.quilometros_ano || 'N/A'}
                            </p>
                          </div>

                          <h4 className="font-medium text-slate-700 border-b pb-2">Dados da Viatura</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Marca</Label>
                              <Input
                                value={viaturaData.viatura_marca}
                                onChange={(e) => setViaturaData({ ...viaturaData, viatura_marca: e.target.value })}
                                placeholder="Ex: BMW"
                                data-testid="viatura-marca"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Modelo</Label>
                              <Input
                                value={viaturaData.viatura_modelo}
                                onChange={(e) => setViaturaData({ ...viaturaData, viatura_modelo: e.target.value })}
                                placeholder="Ex: Série 3"
                                data-testid="viatura-modelo"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Versão</Label>
                              <Input
                                value={viaturaData.viatura_versao}
                                onChange={(e) => setViaturaData({ ...viaturaData, viatura_versao: e.target.value })}
                                placeholder="Ex: 320d M Sport"
                                data-testid="viatura-versao"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Combustível</Label>
                              <Select
                                value={viaturaData.viatura_combustivel || undefined}
                                onValueChange={(v) => setViaturaData({ ...viaturaData, viatura_combustivel: v })}
                              >
                                <SelectTrigger data-testid="viatura-combustivel">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gasolina">Gasolina</SelectItem>
                                  <SelectItem value="diesel">Diesel</SelectItem>
                                  <SelectItem value="hibrido">Híbrido</SelectItem>
                                  <SelectItem value="eletrico">Elétrico</SelectItem>
                                  <SelectItem value="phev">PHEV</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label>Cor</Label>
                              <Input
                                value={viaturaData.viatura_cor}
                                onChange={(e) => setViaturaData({ ...viaturaData, viatura_cor: e.target.value })}
                                placeholder="Ex: Preto Metalizado"
                                data-testid="viatura-cor"
                              />
                            </div>
                          </div>

                          <h4 className="font-medium text-slate-700 border-b pb-2 mt-4">Dados do Contrato</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Prazo (meses)</Label>
                              <Input
                                type="number"
                                value={viaturaData.contrato_prazo}
                                onChange={(e) => setViaturaData({ ...viaturaData, contrato_prazo: e.target.value })}
                                placeholder="Ex: 48"
                                data-testid="contrato-prazo"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Km/Ano</Label>
                              <Input
                                type="number"
                                value={viaturaData.contrato_km_ano}
                                onChange={(e) => setViaturaData({ ...viaturaData, contrato_km_ano: e.target.value })}
                                placeholder="Ex: 20000"
                                data-testid="contrato-km-ano"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Mensalidade (€)</Label>
                              <Input
                                type="number"
                                value={viaturaData.contrato_mensalidade}
                                onChange={(e) => setViaturaData({ ...viaturaData, contrato_mensalidade: e.target.value })}
                                placeholder="Ex: 450"
                                data-testid="contrato-mensalidade"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Entrada (€)</Label>
                              <Input
                                type="number"
                                value={viaturaData.contrato_entrada}
                                onChange={(e) => setViaturaData({ ...viaturaData, contrato_entrada: e.target.value })}
                                placeholder="Ex: 3000"
                                data-testid="contrato-entrada"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={() => handleViaturaUpdate(caseItem.id)}
                            disabled={saving}
                            className="w-full bg-[#224c57] hover:bg-[#224c57]/90 mt-4"
                            data-testid="save-viatura-btn"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Guardar Viatura & Contrato
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {caseItem.viatura_marca ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Vehicle Info */}
                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                          <h4 className="font-medium text-[#224c57] flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Viatura Selecionada
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Marca</span>
                              <span className="font-medium">{caseItem.viatura_marca}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Modelo</span>
                              <span className="font-medium">{caseItem.viatura_modelo || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Versão</span>
                              <span className="font-medium">{caseItem.viatura_versao || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Combustível</span>
                              <span className="font-medium capitalize">{caseItem.viatura_combustivel || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Cor</span>
                              <span className="font-medium">{caseItem.viatura_cor || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contract Info */}
                        <div className="p-4 bg-[#40eea4]/10 rounded-xl space-y-3">
                          <h4 className="font-medium text-[#224c57] flex items-center gap-2">
                            <Euro className="h-4 w-4" />
                            Condições do Contrato
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Prazo</span>
                              <span className="font-medium">{caseItem.contrato_prazo ? `${caseItem.contrato_prazo} meses` : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Km/Ano</span>
                              <span className="font-medium">{caseItem.contrato_km_ano ? `${caseItem.contrato_km_ano.toLocaleString()} km` : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mensalidade</span>
                              <span className="font-medium text-[#224c57]">{caseItem.contrato_mensalidade ? `${caseItem.contrato_mensalidade} €` : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Entrada</span>
                              <span className="font-medium">{caseItem.contrato_entrada ? `${caseItem.contrato_entrada} €` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhuma viatura adicionada a este processo</p>
                        <p className="text-sm mt-1">Clique em "Adicionar Viatura" para definir os detalhes</p>
                      </div>
                    )}

                    {/* Client preferences */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-700 mb-3">Preferências do Cliente</h4>
                      <div className="grid sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Interesse:</span>
                          <p className="font-medium">{caseItem.carro_interesse || 'Não especificado'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Orçamento mensal:</span>
                          <p className="font-medium">{caseItem.orcamento_mensal ? `${caseItem.orcamento_mensal} €` : '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Prazo desejado:</span>
                          <p className="font-medium">{caseItem.prazo_meses ? `${caseItem.prazo_meses} meses` : '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Km/ano desejados:</span>
                          <p className="font-medium">{caseItem.quilometros_ano ? `${caseItem.quilometros_ano.toLocaleString()} km` : '-'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">Nenhum documento submetido</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700">{doc.tipo_documento}</p>
                          <p className="text-sm text-slate-400 truncate">{doc.filename}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={doc.estado_documento} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Dialog open={docDialogOpen && selectedDoc?.id === doc.id} onOpenChange={(open) => {
                            setDocDialogOpen(open);
                            if (open) setSelectedDoc({ ...doc });
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDoc({ ...doc })}
                                data-testid={`edit-doc-${doc.id}`}
                              >
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atualizar Documento</DialogTitle>
                              </DialogHeader>
                              {selectedDoc && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select
                                      value={selectedDoc.estado_documento}
                                      onValueChange={(v) => setSelectedDoc({ ...selectedDoc, estado_documento: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {STATUS_DOCUMENTO.map((s) => (
                                          <SelectItem key={s} value={s}>
                                            {s.replace(/_/g, ' ')}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <Textarea
                                      value={selectedDoc.notas_admin || ''}
                                      onChange={(e) => setSelectedDoc({ ...selectedDoc, notas_admin: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="notas_visiveis"
                                      checked={selectedDoc.notas_visiveis}
                                      onChange={(e) => setSelectedDoc({ ...selectedDoc, notas_visiveis: e.target.checked })}
                                    />
                                    <Label htmlFor="notas_visiveis">Visíveis para o cliente</Label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedDoc({ ...selectedDoc, estado_documento: 'aprovado' })}
                                      className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedDoc({ ...selectedDoc, estado_documento: 'rejeitado' })}
                                      className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                  <Button
                                    onClick={handleDocumentUpdate}
                                    disabled={saving}
                                    className="w-full bg-[#224c57] hover:bg-[#224c57]/90"
                                  >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Guardar
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Processos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cases.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">Nenhum processo</p>
                ) : (
                  <div className="space-y-4">
                    {cases.map((caseItem) => (
                      <div key={caseItem.id} className="p-4 rounded-xl bg-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">Processo #{caseItem.id.slice(0, 8)}</p>
                            <p className="text-sm text-slate-400">
                              Criado em {new Date(caseItem.created_at).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                          <StatusBadge status={caseItem.status_global} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                              value={caseItem.status_global}
                              onValueChange={(v) => handleCaseUpdate(caseItem.id, { status_global: v })}
                            >
                              <SelectTrigger data-testid={`case-status-${caseItem.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_GLOBAL.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Prioridade</Label>
                            <Select
                              value={caseItem.prioridade}
                              onValueChange={(v) => handleCaseUpdate(caseItem.id, { prioridade: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notas Admin</Label>
                          <Textarea
                            defaultValue={caseItem.observacoes_admin || ''}
                            onBlur={(e) => {
                              if (e.target.value !== caseItem.observacoes_admin) {
                                handleCaseUpdate(caseItem.id, { observacoes_admin: e.target.value });
                              }
                            }}
                            rows={2}
                            placeholder="Adicionar notas..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminClientDetail;

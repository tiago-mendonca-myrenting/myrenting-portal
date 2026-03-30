import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Car, Calendar, Euro, Clock, Edit2, Save, X, Gauge, CheckCircle2 } from 'lucide-react';

const CasePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    carro_interesse: '',
    orcamento_mensal: '',
    entrada_inicial: '',
    prazo_meses: '',
    quilometros_ano: '',
    observacoes_cliente: ''
  });

  useEffect(() => {
    fetchCase();
  }, []);

  const fetchCase = async () => {
    try {
      const response = await api.get('/cases');
      const myCase = response.data[0];
      if (myCase) {
        setCurrentCase(myCase);
        setFormData({
          carro_interesse: myCase.carro_interesse || '',
          orcamento_mensal: myCase.orcamento_mensal || '',
          entrada_inicial: myCase.entrada_inicial || '',
          prazo_meses: myCase.prazo_meses || '',
          quilometros_ano: myCase.quilometros_ano || '',
          observacoes_cliente: myCase.observacoes_cliente || ''
        });
      }
    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('Erro ao carregar processo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/cases/${currentCase.id}`, {
        carro_interesse: formData.carro_interesse || null,
        orcamento_mensal: formData.orcamento_mensal ? parseFloat(formData.orcamento_mensal) : null,
        entrada_inicial: formData.entrada_inicial ? parseFloat(formData.entrada_inicial) : null,
        prazo_meses: formData.prazo_meses ? parseInt(formData.prazo_meses) : null,
        quilometros_ano: formData.quilometros_ano ? parseInt(formData.quilometros_ano) : null,
        observacoes_cliente: formData.observacoes_cliente || null
      });
      setCurrentCase(response.data);
      setEditing(false);
      toast.success('Dados guardados com sucesso!');
    } catch (error) {
      toast.error('Erro ao guardar dados');
    } finally {
      setSaving(false);
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

  if (!currentCase) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-500">Não existe processo associado.</p>
        </div>
      </Layout>
    );
  }

  const hasVehicle = currentCase.viatura_marca;

  return (
    <Layout>
      <div className="space-y-8" data-testid="case-page">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            O Meu Processo
          </h1>
          <p className="text-slate-500 mt-1">
            Acompanhe o estado e detalhes do seu processo de renting
          </p>
        </div>

        {/* Vehicle Card - Only show if vehicle is selected by admin */}
        {hasVehicle && (
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#224c57] to-[#355761] p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Car className="h-6 w-6" />
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  A Sua Viatura
                </h2>
                {currentCase.status_global === 'aprovado' && (
                  <span className="ml-auto flex items-center gap-1 bg-[#4ad334] text-black px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovado
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {currentCase.viatura_marca} {currentCase.viatura_modelo}
              </div>
              {currentCase.viatura_versao && (
                <p className="text-slate-200">{currentCase.viatura_versao}</p>
              )}
            </div>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#40eea4]/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#224c57]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Prazo</p>
                    <p className="font-semibold text-[#224c57]">
                      {currentCase.contrato_prazo ? `${currentCase.contrato_prazo} meses` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#40eea4]/20 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-[#224c57]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Km/Ano</p>
                    <p className="font-semibold text-[#224c57]">
                      {currentCase.contrato_km_ano ? `${currentCase.contrato_km_ano.toLocaleString()} km` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4ad334]/20 flex items-center justify-center">
                    <Euro className="h-5 w-5 text-[#224c57]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Mensalidade</p>
                    <p className="font-bold text-xl text-[#224c57]">
                      {currentCase.contrato_mensalidade ? `${currentCase.contrato_mensalidade} €` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Euro className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Entrada</p>
                    <p className="font-semibold text-slate-700">
                      {currentCase.contrato_entrada ? `${currentCase.contrato_entrada} €` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional vehicle details */}
              <div className="mt-6 pt-6 border-t grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Combustível</span>
                  <span className="font-medium capitalize">{currentCase.viatura_combustivel || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cor</span>
                  <span className="font-medium">{currentCase.viatura_cor || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-1 border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Estado do Processo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus={currentCase.status_global} />
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="lg:col-span-2 border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                As Suas Preferências
              </CardTitle>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="gap-2"
                  data-testid="edit-case-btn"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        carro_interesse: currentCase.carro_interesse || '',
                        orcamento_mensal: currentCase.orcamento_mensal || '',
                        entrada_inicial: currentCase.entrada_inicial || '',
                        prazo_meses: currentCase.prazo_meses || '',
                        quilometros_ano: currentCase.quilometros_ano || '',
                        observacoes_cliente: currentCase.observacoes_cliente || ''
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2"
                    data-testid="save-case-btn"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Info */}
              <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Estado:</span>
                  <StatusBadge status={currentCase.status_global} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Prioridade:</span>
                  <span className={`text-sm font-medium ${currentCase.prioridade === 'alta' ? 'text-orange-600' : 'text-slate-600'}`}>
                    {currentCase.prioridade === 'alta' ? 'Alta' : 'Normal'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Criado:</span>
                  <span className="text-sm text-slate-600">
                    {new Date(currentCase.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-400" />
                    Carro de Interesse
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.carro_interesse}
                      onChange={(e) => setFormData({ ...formData, carro_interesse: e.target.value })}
                      placeholder="Ex: BMW Série 3"
                      data-testid="input-carro"
                    />
                  ) : (
                    <p className="text-slate-700 p-2">{currentCase.carro_interesse || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-slate-400" />
                    Orçamento Mensal (€)
                  </Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={formData.orcamento_mensal}
                      onChange={(e) => setFormData({ ...formData, orcamento_mensal: e.target.value })}
                      placeholder="Ex: 500"
                      data-testid="input-orcamento"
                    />
                  ) : (
                    <p className="text-slate-700 p-2">{currentCase.orcamento_mensal ? `${currentCase.orcamento_mensal} €` : '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-slate-400" />
                    Entrada Inicial (€)
                  </Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={formData.entrada_inicial}
                      onChange={(e) => setFormData({ ...formData, entrada_inicial: e.target.value })}
                      placeholder="Ex: 3000"
                      data-testid="input-entrada"
                    />
                  ) : (
                    <p className="text-slate-700 p-2">{currentCase.entrada_inicial ? `${currentCase.entrada_inicial} €` : '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Prazo (Meses)
                  </Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={formData.prazo_meses}
                      onChange={(e) => setFormData({ ...formData, prazo_meses: e.target.value })}
                      placeholder="Ex: 48"
                      data-testid="input-prazo"
                    />
                  ) : (
                    <p className="text-slate-700 p-2">{currentCase.prazo_meses ? `${currentCase.prazo_meses} meses` : '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    Km/Ano
                  </Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={formData.quilometros_ano}
                      onChange={(e) => setFormData({ ...formData, quilometros_ano: e.target.value })}
                      placeholder="Ex: 20000"
                      data-testid="input-km-ano"
                    />
                  ) : (
                    <p className="text-slate-700 p-2">{currentCase.quilometros_ano ? `${currentCase.quilometros_ano.toLocaleString()} km` : '-'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                {editing ? (
                  <Textarea
                    value={formData.observacoes_cliente}
                    onChange={(e) => setFormData({ ...formData, observacoes_cliente: e.target.value })}
                    placeholder="Adicione informações adicionais sobre o que procura..."
                    rows={4}
                    data-testid="input-observacoes"
                  />
                ) : (
                  <p className="text-slate-700 p-2 whitespace-pre-wrap">{currentCase.observacoes_cliente || 'Sem observações'}</p>
                )}
              </div>

              {/* Admin Notes */}
              {currentCase.observacoes_admin && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Label className="text-blue-700 mb-2 block">Notas do Consultor</Label>
                  <p className="text-blue-900 whitespace-pre-wrap">{currentCase.observacoes_admin}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CasePage;

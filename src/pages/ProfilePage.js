import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Save, Trash2, User, Shield, CheckCircle2, Car, CreditCard } from 'lucide-react';

const TIPOS_HABITACAO = [
  { value: 'alugada_renda', label: 'Alugada (Renda)' },
  { value: 'propria_hipoteca', label: 'Própria com Hipoteca' },
  { value: 'propria_sem_hipoteca', label: 'Própria sem Hipoteca' },
  { value: 'familiares', label: 'Familiares' }
];

const SITUACOES_PROFISSIONAIS = [
  { value: 'conta_outrem', label: 'Conta de Outrem' },
  { value: 'privado', label: 'Privado' },
  { value: 'publico', label: 'Público' },
  { value: 'conta_propria', label: 'Conta Própria' },
  { value: 'reformado', label: 'Reformado(a)' },
  { value: 'desempregado', label: 'Desempregado(a)' },
  { value: 'estudante', label: 'Estudante' }
];

const TIPOS_CONTRATO = [
  { value: 'sem_termo', label: 'Sem termo' },
  { value: 'com_termo', label: 'Com termo' },
  { value: 'sem_contrato', label: 'Sem contrato' }
];

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nif: '',
    address: '',
    data_nascimento: '',
    estado_civil: '',
    rendimentos_mensais: '',
    profissao: '',
    empresa: '',
    observacoes: '',
    tipo_cliente: 'particular',
    tipo_habitacao: '',
    situacao_profissional: '',
    anos_entidade: '',
    tipo_contrato: '',
    carta_conducao_numero: '',
    carta_conducao_entidade: '',
    carta_conducao_validade: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const { user: userData, profile: profileData } = response.data;
      setProfile(profileData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        nif: userData.nif || '',
        address: userData.address || '',
        data_nascimento: profileData?.data_nascimento || '',
        estado_civil: profileData?.estado_civil || '',
        rendimentos_mensais: profileData?.rendimentos_mensais || '',
        profissao: profileData?.profissao || '',
        empresa: profileData?.empresa || '',
        observacoes: profileData?.observacoes || '',
        tipo_cliente: profileData?.tipo_cliente || 'particular',
        tipo_habitacao: profileData?.tipo_habitacao || '',
        situacao_profissional: profileData?.situacao_profissional || '',
        anos_entidade: profileData?.anos_entidade || '',
        tipo_contrato: profileData?.tipo_contrato || '',
        carta_conducao_numero: profileData?.carta_conducao_numero || '',
        carta_conducao_entidade: profileData?.carta_conducao_entidade || '',
        carta_conducao_validade: profileData?.carta_conducao_validade || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        name: formData.name,
        phone: formData.phone || null,
        nif: formData.nif || null,
        address: formData.address || null,
        data_nascimento: formData.data_nascimento || null,
        estado_civil: formData.estado_civil || null,
        rendimentos_mensais: formData.rendimentos_mensais ? parseFloat(formData.rendimentos_mensais) : null,
        profissao: formData.profissao || null,
        empresa: formData.empresa || null,
        observacoes: formData.observacoes || null,
        tipo_cliente: formData.tipo_cliente,
        tipo_habitacao: formData.tipo_habitacao || null,
        situacao_profissional: formData.situacao_profissional || null,
        anos_entidade: formData.anos_entidade || null,
        tipo_contrato: formData.tipo_contrato || null,
        carta_conducao_numero: formData.carta_conducao_numero || null,
        carta_conducao_entidade: formData.carta_conducao_entidade || null,
        carta_conducao_validade: formData.carta_conducao_validade || null
      });
      toast.success('Perfil atualizado com sucesso!');
      fetchProfile();
    } catch (error) {
      toast.error('Erro ao guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/profile');
      toast.success('Conta eliminada com sucesso');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Erro ao eliminar conta');
    } finally {
      setDeleting(false);
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8" data-testid="profile-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              O Meu Perfil
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir os seus dados pessoais
            </p>
          </div>
          {profile?.completo && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Perfil Completo</span>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="912 345 678"
                  data-testid="profile-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>NIF</Label>
                <Input
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  placeholder="123456789"
                  data-testid="profile-nif"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Morada</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, código postal, cidade"
                  data-testid="profile-address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Shield className="h-5 w-5" />
              Informação Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tipo de Cliente *</Label>
                <Select
                  value={formData.tipo_cliente}
                  onValueChange={(value) => setFormData({ ...formData, tipo_cliente: value })}
                >
                  <SelectTrigger data-testid="profile-tipo-cliente">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  data-testid="profile-data-nascimento"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado Civil</Label>
                <Select
                  value={formData.estado_civil || undefined}
                  onValueChange={(value) => setFormData({ ...formData, estado_civil: value })}
                >
                  <SelectTrigger data-testid="profile-estado-civil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    <SelectItem value="uniao_facto">União de Facto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Habitação *</Label>
                <Select
                  value={formData.tipo_habitacao || undefined}
                  onValueChange={(value) => setFormData({ ...formData, tipo_habitacao: value })}
                >
                  <SelectTrigger data-testid="profile-tipo-habitacao">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_HABITACAO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rendimentos Mensais (€)</Label>
                <Input
                  type="number"
                  value={formData.rendimentos_mensais}
                  onChange={(e) => setFormData({ ...formData, rendimentos_mensais: e.target.value })}
                  placeholder="Ex: 1500"
                  data-testid="profile-rendimentos"
                />
              </div>
              <div className="space-y-2">
                <Label>Situação Profissional *</Label>
                <Select
                  value={formData.situacao_profissional || undefined}
                  onValueChange={(value) => setFormData({ ...formData, situacao_profissional: value })}
                >
                  <SelectTrigger data-testid="profile-situacao-profissional">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACOES_PROFISSIONAIS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profissão</Label>
                <Input
                  value={formData.profissao}
                  onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  placeholder="Ex: Engenheiro"
                  data-testid="profile-profissao"
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                  data-testid="profile-empresa"
                />
              </div>
              <div className="space-y-2">
                <Label>Nº de Anos na Entidade</Label>
                <Input
                  value={formData.anos_entidade}
                  onChange={(e) => setFormData({ ...formData, anos_entidade: e.target.value })}
                  placeholder="Ex: 5"
                  data-testid="profile-anos-entidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select
                  value={formData.tipo_contrato || undefined}
                  onValueChange={(value) => setFormData({ ...formData, tipo_contrato: value })}
                >
                  <SelectTrigger data-testid="profile-tipo-contrato">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONTRATO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driving License Info */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <CreditCard className="h-5 w-5" />
              Carta de Condução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Carta de Condução Nº</Label>
                <Input
                  value={formData.carta_conducao_numero}
                  onChange={(e) => setFormData({ ...formData, carta_conducao_numero: e.target.value })}
                  placeholder="Ex: AB-123456"
                  data-testid="profile-carta-numero"
                />
              </div>
              <div className="space-y-2">
                <Label>Entidade Emissora</Label>
                <Input
                  value={formData.carta_conducao_entidade}
                  onChange={(e) => setFormData({ ...formData, carta_conducao_entidade: e.target.value })}
                  placeholder="Ex: IMT"
                  data-testid="profile-carta-entidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formData.carta_conducao_validade}
                  onChange={(e) => setFormData({ ...formData, carta_conducao_validade: e.target.value })}
                  data-testid="profile-carta-validade"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observations */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
                data-testid="profile-observacoes"
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2"
                data-testid="profile-save-btn"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl border-red-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 mb-4">
              Eliminar a sua conta irá remover permanentemente todos os seus dados, incluindo documentos e mensagens.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" data-testid="delete-account-btn">
                  <Trash2 className="h-4 w-4" />
                  Eliminar Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser revertida. Todos os seus dados serão permanentemente eliminados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sim, eliminar conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;

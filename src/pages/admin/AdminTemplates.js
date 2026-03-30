import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Mail, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const CATEGORIAS = [
  { value: 'boas_vindas', label: 'Boas-vindas' },
  { value: 'pedido_documentos', label: 'Pedido de Documentos' },
  { value: 'falta_info', label: 'Falta Informação' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'a_aguardar_resposta_cliente', label: 'Aguardar Resposta' },
  { value: 'followup', label: 'Follow-up' }
];

const AdminTemplates = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    assunto: '',
    corpo: '',
    ativo: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.categoria || !formData.corpo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        await api.put(`/admin/templates/${editingTemplate.id}`, formData);
        toast.success('Template atualizado!');
      } else {
        await api.post('/admin/templates', formData);
        toast.success('Template criado!');
      }
      setDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error('Erro ao guardar template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Tem a certeza que quer eliminar este template?')) return;
    
    try {
      await api.delete(`/admin/templates/${templateId}`);
      toast.success('Template eliminado!');
      fetchTemplates();
    } catch (error) {
      toast.error('Erro ao eliminar template');
    }
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setFormData({
      nome: template.nome,
      categoria: template.categoria,
      assunto: template.assunto,
      corpo: template.corpo,
      ativo: template.ativo
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      nome: '',
      categoria: '',
      assunto: '',
      corpo: '',
      ativo: true
    });
  };

  const getCategoriaLabel = (value) => {
    return CATEGORIAS.find((c) => c.value === value)?.label || value;
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-templates-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Templates de Mensagens
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir templates de mensagens automáticas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2" data-testid="create-template-btn">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Boas-vindas"
                    data-testid="template-nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                  >
                    <SelectTrigger data-testid="template-categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input
                    value={formData.assunto}
                    onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                    placeholder="Ex: Bem-vindo à My Renting"
                    data-testid="template-assunto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Corpo da Mensagem *</Label>
                  <Textarea
                    value={formData.corpo}
                    onChange={(e) => setFormData({ ...formData, corpo: e.target.value })}
                    rows={6}
                    placeholder="Use {nome_cliente}, {documento}, {lista_documentos} como variáveis..."
                    data-testid="template-corpo"
                  />
                  <p className="text-xs text-slate-400">
                    Variáveis disponíveis: {'{nome_cliente}'}, {'{documento}'}, {'{lista_documentos}'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#224c57] hover:bg-[#224c57]/90"
                  data-testid="save-template-btn"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingTemplate ? 'Atualizar' : 'Criar'} Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates List */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Mail className="h-5 w-5" />
              Templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum template criado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      template.ativo
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#224c57]">{template.nome}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#40eea4]/20 text-[#224c57]">
                            {getCategoriaLabel(template.categoria)}
                          </span>
                          {!template.ativo && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-500">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{template.assunto}</p>
                        <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
                          {template.corpo}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(template)}
                          data-testid={`edit-template-${template.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminTemplates;

import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle2, XCircle, Loader2, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'submetido', label: 'Submetido' },
  { value: 'em_verificacao', label: 'Em Verificação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'precisa_de_mais_info', label: 'Mais Info' }
];

const AdminDocuments = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/documents${statusFilter ? `?estado=${statusFilter}` : ''}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoc) return;
    setSaving(true);
    try {
      await api.put(`/admin/documents/${selectedDoc.id}`, {
        estado_documento: selectedDoc.estado_documento,
        notas_admin: selectedDoc.notas_admin,
        notas_visiveis: selectedDoc.notas_visiveis
      });
      toast.success('Documento atualizado!');
      setDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      toast.error('Erro ao atualizar documento');
    } finally {
      setSaving(false);
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

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-documents-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Documentos
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir todos os documentos submetidos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="status-filter">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents Table */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <FileText className="h-5 w-5" />
              Lista de Documentos ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ficheiro</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.tipo_documento}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{doc.filename}</TableCell>
                        <TableCell>
                          <StatusBadge status={doc.estado_documento} />
                        </TableCell>
                        <TableCell>
                          {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Dialog open={dialogOpen && selectedDoc?.id === doc.id} onOpenChange={(open) => {
                              setDialogOpen(open);
                              if (open) setSelectedDoc({ ...doc });
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDoc({ ...doc })}
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
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                      <p className="text-sm text-slate-500">Ficheiro</p>
                                      <p className="font-medium">{selectedDoc.filename}</p>
                                    </div>
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
                                          {STATUS_OPTIONS.slice(1).map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                              {s.label}
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
                                      onClick={handleUpdate}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDocuments;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
/* eslint-disable no-unused-vars */
import { FolderOpen, Eye, Loader2, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'por_iniciar', label: 'Por Iniciar' },
  { value: 'a_aguardar_documentos', label: 'A Aguardar Docs' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'a_aguardar_resposta_cliente', label: 'Aguardar Resposta' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'concluido', label: 'Concluído' }
];

const PRIORIDADE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' }
];

const AdminCases = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');

  useEffect(() => {
    fetchCases();
  }, [statusFilter, prioridadeFilter]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      let url = '/admin/cases?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (prioridadeFilter) url += `prioridade=${prioridadeFilter}`;
      const response = await api.get(url);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      await api.put(`/cases/${caseId}`, { status_global: newStatus });
      toast.success('Estado atualizado!');
      fetchCases();
    } catch (error) {
      toast.error('Erro ao atualizar estado');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-cases-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Processos
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir todos os processos de renting
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]" data-testid="status-filter">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cases Table */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <FolderOpen className="h-5 w-5" />
              Lista de Processos ({cases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum processo encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Carro</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-mono text-sm">
                          {caseItem.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {caseItem.cliente_nome || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={caseItem.status_global}
                            onValueChange={(v) => handleStatusChange(caseItem.id, v)}
                          >
                            <SelectTrigger className="w-[160px] h-8">
                              <StatusBadge status={caseItem.status_global} />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.slice(1).map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${caseItem.prioridade === 'alta' ? 'text-orange-600' : 'text-slate-500'}`}>
                            {caseItem.prioridade === 'alta' ? 'Alta' : 'Normal'}
                          </span>
                        </TableCell>
                        <TableCell>{caseItem.carro_interesse || '-'}</TableCell>
                        <TableCell>
                          {new Date(caseItem.updated_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/clients/${caseItem.cliente_id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
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

export default AdminCases;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
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

  const kpiCards = [
    {
      title: 'Total Clientes',
      value: stats?.total_clientes || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/clients'
    },
    {
      title: 'A Aguardar Docs',
      value: stats?.a_aguardar_documentos || 0,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      link: '/admin/cases?status=a_aguardar_documentos'
    },
    {
      title: 'Em Análise',
      value: stats?.em_analise || 0,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/cases?status=em_analise'
    },
    {
      title: 'Aprovados',
      value: stats?.aprovados || 0,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      link: '/admin/cases?status=aprovado'
    },
    {
      title: 'Rejeitados',
      value: stats?.rejeitados || 0,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      link: '/admin/cases?status=rejeitado'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8" data-testid="admin-dashboard">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Dashboard Admin
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral da plataforma My Renting
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Link key={index} to={kpi.link}>
                <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {kpi.value}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{kpi.title}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Cases */}
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Processos Recentes
              </CardTitle>
              <Link to="/admin/cases" className="text-sm text-[#224c57] hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.recent_cases?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_cases.map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      to={`/admin/clients/${caseItem.cliente_id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-700">Processo #{caseItem.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(caseItem.updated_at).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <StatusBadge status={caseItem.status_global} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">Sem processos recentes</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Documentos Recentes
              </CardTitle>
              <Link to="/admin/documents" className="text-sm text-[#224c57] hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.recent_documents?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-700">{doc.tipo_documento}</p>
                        <p className="text-sm text-slate-400 truncate max-w-[200px]">{doc.filename}</p>
                      </div>
                      <StatusBadge status={doc.estado_documento} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">Sem documentos recentes</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Distribuição de Processos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(stats?.processos_por_status || {}).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-slate-50 rounded-xl">
                  <StatusBadge status={status} />
                  <p className="text-2xl font-bold text-[#224c57] mt-2">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

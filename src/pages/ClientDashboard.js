import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Car,
  Loader2
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [tipoCliente, setTipoCliente] = useState('particular');
  const [currentCase, setCurrentCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [checklistRes, casesRes, messagesRes, unreadRes] = await Promise.all([
        api.get('/documents/checklist'),
        api.get('/cases'),
        api.get('/messages'),
        api.get('/messages/unread-count')
      ]);
      
      setChecklist(checklistRes.data.checklist);
      setTipoCliente(checklistRes.data.tipo_cliente);
      setCurrentCase(casesRes.data[0] || null);
      setMessages(messagesRes.data.slice(-5));
      setUnreadCount(unreadRes.data.count);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!checklist.length) return 0;
    const completed = checklist.filter(
      (item) => item.status === 'aprovado'
    ).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejeitado':
      case 'precisa_de_mais_info':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'submetido':
      case 'em_verificacao':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
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
      <div className="space-y-8" data-testid="client-dashboard">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Olá, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 mt-1">
              Acompanhe o estado do seu processo de renting
            </p>
          </div>
          <Link to="/documents">
            <Button className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2" data-testid="upload-docs-btn">
              <Upload className="h-4 w-4" />
              Carregar Documentos
            </Button>
          </Link>
        </div>

        {/* Status Card */}
        {currentCase && (
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#224c57] to-[#355761] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 text-sm">Estado do Processo</p>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={currentCase.status_global} className="text-sm px-3 py-1" />
                  </div>
                </div>
                <div className="hidden md:block">
                  <Car className="h-16 w-16 text-[#40eea4]/50" />
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Progresso dos Documentos</span>
                <span className="text-sm font-medium text-[#224c57]">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
              <Link to="/case" className="inline-flex items-center gap-2 text-[#224c57] font-medium mt-4 hover:underline">
                Ver detalhes do processo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Checklist */}
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <FileText className="h-5 w-5" />
                Documentos Necessários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-slate-700">{item.tipo}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
              <Link to="/documents" className="block mt-4">
                <Button variant="outline" className="w-full border-[#224c57] text-[#224c57]" data-testid="view-documents-btn">
                  Ver Todos os Documentos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <MessageSquare className="h-5 w-5" />
                Mensagens
                {unreadCount > 0 && (
                  <span className="ml-2 bg-[#4ad334] text-black text-xs px-2 py-1 rounded-full">
                    {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sem mensagens</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(-3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl ${
                        !msg.lida && msg.receiver_id === user?.id
                          ? 'bg-[#40eea4]/10 border border-[#40eea4]/30'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#224c57]">{msg.sender_name}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{msg.texto}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/messages" className="block mt-4">
                <Button variant="outline" className="w-full border-[#224c57] text-[#224c57]" data-testid="view-messages-btn">
                  Ver Conversa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ClientDashboard;

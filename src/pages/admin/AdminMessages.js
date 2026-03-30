import { useState, useEffect, useRef } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Send, MessageSquare, Users } from 'lucide-react';

const AdminMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchClientMessages(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchInitialData = async () => {
    try {
      const [clientsRes, templatesRes] = await Promise.all([
        api.get('/admin/clients'),
        api.get('/admin/templates')
      ]);
      setClients(clientsRes.data);
      setTemplates(templatesRes.data.filter((t) => t.ativo));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientMessages = async (client) => {
    try {
      const caseId = client.cases?.[0]?.id;
      if (!caseId) return;
      
      const response = await api.get(`/messages?case_id=${caseId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedClient?.cases?.[0]) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        case_id: selectedClient.cases[0].id,
        texto: newMessage.trim(),
        template_id: selectedTemplate || null
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      setSelectedTemplate('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template && selectedClient) {
      let text = template.corpo;
      text = text.replace('{nome_cliente}', selectedClient.name || '');
      setNewMessage(text);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
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
      <div className="space-y-6" data-testid="admin-messages-page">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Mensagens
          </h1>
          <p className="text-slate-500 mt-1">
            Comunicar com os clientes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Clients List */}
          <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="px-4 pb-4 space-y-2">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        selectedClient?.id === client.id
                          ? 'bg-[#224c57] text-white'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                      data-testid={`client-${client.id}`}
                    >
                      <p className="font-medium truncate">{client.name}</p>
                      <p className={`text-sm truncate ${selectedClient?.id === client.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {client.email}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
            {selectedClient ? (
              <>
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-lg font-semibold text-[#224c57]">
                    {selectedClient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Sem mensagens</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isMine = msg.sender_id === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] ${
                                  isMine
                                    ? 'bg-[#224c57] text-white rounded-2xl rounded-br-md'
                                    : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md'
                                } px-4 py-3`}
                              >
                                {!isMine && (
                                  <p className="text-xs font-medium text-[#224c57] mb-1">
                                    {msg.sender_name}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                                <p className={`text-xs mt-1 ${isMine ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {formatDate(msg.created_at)} {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t bg-slate-50 space-y-3">
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Usar template (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva a sua mensagem..."
                        className="min-h-[60px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        data-testid="admin-message-input"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="bg-[#224c57] hover:bg-[#224c57]/90 h-auto"
                        data-testid="admin-send-btn"
                      >
                        {sending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Selecione um cliente para ver as mensagens</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminMessages;

import { useState, useEffect, useRef } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Send, MessageSquare, User } from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentCase, setCurrentCase] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    try {
      const [casesRes, messagesRes] = await Promise.all([
        api.get('/cases'),
        api.get('/messages')
      ]);
      
      const myCase = casesRes.data[0];
      setCurrentCase(myCase);
      
      if (myCase) {
        const caseMessages = messagesRes.data.filter((m) => m.case_id === myCase.id);
        setMessages(caseMessages);
        
        // Mark messages as read
        await api.put(`/messages/read-all?case_id=${myCase.id}`);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentCase) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        case_id: currentCase.id,
        texto: newMessage.trim()
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
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

  const messageGroups = groupMessagesByDate();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto" data-testid="messages-page">
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <MessageSquare className="h-5 w-5" />
              Conversa com My Renting
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                  <p>Ainda não há mensagens</p>
                  <p className="text-sm">Envie uma mensagem para iniciar a conversa</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(messageGroups).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {formatDate(msgs[0].created_at)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {msgs.map((msg) => {
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
                                <p
                                  className={`text-xs mt-1 ${
                                    isMine ? 'text-slate-300' : 'text-slate-400'
                                  }`}
                                >
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-slate-50">
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
                  data-testid="message-input"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-[#224c57] hover:bg-[#224c57]/90 h-auto"
                  data-testid="send-message-btn"
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
        </Card>
      </div>
    </Layout>
  );
};

export default MessagesPage;

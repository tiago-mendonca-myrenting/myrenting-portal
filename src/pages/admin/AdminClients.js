import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { Search, Users, Eye, Loader2 } from 'lucide-react';

const AdminClients = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(searchTerm);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-clients-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Clientes
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir todos os clientes da plataforma
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome, email, NIF..."
                className="pl-10 w-[300px]"
                data-testid="search-clients"
              />
            </div>
            <Button type="submit" className="bg-[#224c57] hover:bg-[#224c57]/90">
              Pesquisar
            </Button>
          </form>
        </div>

        {/* Clients Table */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57] flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <Users className="h-5 w-5" />
              Lista de Clientes ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Estado Processo</TableHead>
                      <TableHead>Data Registo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{client.nif || '-'}</TableCell>
                        <TableCell>
                          {client.cases?.[0] ? (
                            <StatusBadge status={client.cases[0].status_global} />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(client.created_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/clients/${client.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              data-testid={`view-client-${client.id}`}
                            >
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

export default AdminClients;

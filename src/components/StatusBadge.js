import { Badge } from './ui/badge';

const STATUS_LABELS = {
  // Document statuses
  submetido: 'Submetido',
  em_verificacao: 'Em Verificação',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  precisa_de_mais_info: 'Mais Info',
  pendente: 'Pendente',
  // Case statuses
  por_iniciar: 'Por Iniciar',
  a_aguardar_documentos: 'A Aguardar Docs',
  em_analise: 'Em Análise',
  a_aguardar_resposta_cliente: 'Aguardar Resposta',
  concluido: 'Concluído'
};

const STATUS_COLORS = {
  submetido: 'bg-blue-100 text-blue-700 border-blue-200',
  em_verificacao: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  aprovado: 'bg-green-100 text-green-700 border-green-200',
  rejeitado: 'bg-red-100 text-red-700 border-red-200',
  precisa_de_mais_info: 'bg-orange-100 text-orange-700 border-orange-200',
  pendente: 'bg-slate-100 text-slate-600 border-slate-200',
  por_iniciar: 'bg-slate-100 text-slate-600 border-slate-200',
  a_aguardar_documentos: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  em_analise: 'bg-blue-100 text-blue-700 border-blue-200',
  a_aguardar_resposta_cliente: 'bg-orange-100 text-orange-700 border-orange-200',
  concluido: 'bg-green-100 text-green-700 border-green-200'
};

export const StatusBadge = ({ status, className = '' }) => {
  return (
    <Badge
      variant="outline"
      className={`${STATUS_COLORS[status] || STATUS_COLORS.pendente} border ${className}`}
    >
      {STATUS_LABELS[status] || status}
    </Badge>
  );
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
export const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.pendente;

export default StatusBadge;

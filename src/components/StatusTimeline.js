import { Check, Circle, Clock } from 'lucide-react';
import { getStatusLabel } from './StatusBadge';

const TIMELINE_STEPS = [
  { key: 'por_iniciar', label: 'Por Iniciar' },
  { key: 'a_aguardar_documentos', label: 'A Aguardar Documentos' },
  { key: 'em_analise', label: 'Em Análise' },
  { key: 'a_aguardar_resposta_cliente', label: 'Aguardar Resposta' },
  { key: 'aprovado', label: 'Aprovado' },
  { key: 'concluido', label: 'Concluído' }
];

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);
  const isRejected = currentStatus === 'rejeitado';

  if (isRejected) {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-2xl">✕</span>
        </div>
        <h3 className="text-lg font-semibold text-red-700">Processo Rejeitado</h3>
        <p className="text-sm text-slate-500 mt-2">
          Contacte-nos para mais informações
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex flex-col space-y-0">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex items-start">
              {/* Connector line and dot */}
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#4ad334] border-[#4ad334] text-white'
                      : isCurrent
                      ? 'bg-[#40eea4] border-[#40eea4] text-[#0f3522] animate-pulse-green'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      isCompleted ? 'bg-[#4ad334]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className={`pb-8 ${index === TIMELINE_STEPS.length - 1 ? 'pb-0' : ''}`}>
                <h4
                  className={`font-medium ${
                    isCurrent
                      ? 'text-[#224c57]'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </h4>
                {isCurrent && (
                  <p className="text-sm text-slate-500 mt-1">Estado atual</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;

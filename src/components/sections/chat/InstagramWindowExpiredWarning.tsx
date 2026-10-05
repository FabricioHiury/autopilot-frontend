'use client';

interface InstagramWindowExpiredWarningProps {
  lastMessageCustomerAt?: string | null;
}

export function InstagramWindowExpiredWarning({
  lastMessageCustomerAt,
}: InstagramWindowExpiredWarningProps) {
  if (!lastMessageCustomerAt) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-orange-800 mb-1">
            Aguardando primeira mensagem do cliente
          </h4>
          <p className="text-xs text-orange-700">
            O Instagram permite enviar mensagens apenas após o cliente iniciar a conversa. Assim que
            ele enviar a primeira mensagem, você terá 24h para responder.
          </p>
        </div>
      </div>
    );
  }

  const lastMessage = new Date(lastMessageCustomerAt);
  const agora = new Date();
  const diferencaHoras = (agora.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
  const tempoRestante = 24 - diferencaHoras;

  if (tempoRestante <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800 mb-1">Janela de mensagens expirada</h4>
          <p className="text-xs text-red-700">
            Passaram-se mais de 24 horas desde a última mensagem do cliente. Para continuar a
            conversa, aguarde que ele envie uma nova mensagem.
          </p>
        </div>
      </div>
    );
  }

  if (tempoRestante <= 2) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800 mb-1">
            Janela de mensagens expirando em breve
          </h4>
          <p className="text-xs text-yellow-700">
            Restam aproximadamente <strong>{Math.floor(tempoRestante * 60)} minutos</strong> para
            enviar mensagens. Após isso, será necessário aguardar nova mensagem do cliente.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default InstagramWindowExpiredWarning;

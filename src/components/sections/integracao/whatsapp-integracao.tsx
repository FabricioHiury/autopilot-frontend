'use client';
import { useEffect, useState, useRef } from 'react';
import { apiClient, requestData } from '@/services/api.client';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
interface WhatsAppConnection {
  qrCode?: { base64: string };
  status: string;
  message?: string;
  number?: string;
}
interface IntegrationStatus {
  channel: string;
  status: string;
  number?: string;
  message?: string;
}
const isConnected = (status: string) => ['connected', 'open', 'ok'].includes(status.toLowerCase());
export default function WhatsappIntegracao() {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null),
    [remaining, setRemaining] = useState(45);
  const mounted = useRef(true),
    pending = useRef(false);
  async function status() {
    const data = await requestData<{ statusIntegrations: IntegrationStatus[] }>(
      apiClient.get('/integrations/status'),
    );
    const item = data.statusIntegrations.find((i) => i.channel === 'whatsapp');
    if (mounted.current && item && isConnected(item.status))
      setConnection({ status: item.status, number: item.number, message: item.message });
  }
  async function connect() {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await requestData<WhatsAppConnection>(
        apiClient.post('/integrations/whatsapp/connect'),
      );
      if (mounted.current) {
        setConnection(data);
        setRemaining(45);
      }
    } catch (err) {
      if (mounted.current)
        setError(err instanceof Error ? err.message : 'Não foi possível conectar.');
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    void status().catch((err) => setError(err.message));
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!connection || isConnected(connection.status) || error) return;
    const countdown = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    const refresh = setTimeout(() => void connect(), 45000);
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        await status();
        if (mounted.current && active) timer = setTimeout(check, 5000);
      } catch (err) {
        if (mounted.current)
          setError(err instanceof Error ? err.message : 'Não foi possível consultar a conexão.');
      }
    };
    timer = setTimeout(check, 5000);
    return () => {
      active = false;
      clearInterval(countdown);
      clearTimeout(refresh);
      clearTimeout(timer);
    };
  }, [connection, error]);
  async function disconnect() {
    if (!window.confirm('Desconectar o WhatsApp desta loja?')) return;
    setLoading(true);
    try {
      await requestData(apiClient.delete('/integrations/whatsapp'));
      setConnection(null);
      setError(null);
      toast.success('WhatsApp desconectado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível desconectar.');
    } finally {
      setLoading(false);
    }
  }
  const connected = !!connection && isConnected(connection.status);
  const base64 = connection?.qrCode?.base64;
  const qr = base64?.startsWith('data:image/')
    ? base64
    : base64
      ? `data:image/png;base64,${base64}`
      : null;
  return (
    <section className="bg-white rounded-xl border p-6 max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">WhatsApp</h2>
        <span
          className={`rounded-full px-3 py-1 text-sm ${connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
        >
          {connected ? 'Conectado' : connection ? 'Aguardando conexão' : 'Desconectado'}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {connected ? (
        <>
          <p>Seu WhatsApp está conectado.{connection?.number && ` Número: ${connection.number}`}</p>
          <Button variant="outline" onClick={disconnect} disabled={loading}>
            Desconectar sessão
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            No WhatsApp do seu celular, abra Dispositivos conectados e escaneie o QR Code.
          </p>
          {qr && (
            <div className="grid justify-items-center gap-2">
              <img src={qr} alt="QR Code para conectar o WhatsApp" width={240} height={240} />
              <p className="text-xs text-muted-foreground">
                Nova consulta do QR Code em {remaining}s.
              </p>
            </div>
          )}
          {connection && !qr && !error && <p className="text-sm">Preparando o QR Code…</p>}
          <Button onClick={connect} disabled={loading}>
            {loading ? 'Conectando…' : connection ? 'Atualizar QR Code' : 'Conectar WhatsApp'}
          </Button>
        </>
      )}
    </section>
  );
}

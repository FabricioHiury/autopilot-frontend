'use client';
import { useState } from 'react';
import { apiClient, requestData } from '@/services/api.client';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
export function InstagramIntegracao() {
  const [loading, setLoading] = useState(false);
  async function connect() {
    setLoading(true);
    try {
      const result = await requestData<{ url: string }>(apiClient.put('/integrations/instagram'));
      const url = new URL(result.url);
      if (url.protocol !== 'https:')
        throw new Error('O servidor retornou um endereço de conexão inválido.');
      window.location.assign(url.href);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível conectar.');
      setLoading(false);
    }
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Conecte o Instagram</h2>
      <Button onClick={connect} disabled={loading}>
        {loading ? 'Conectando…' : 'Fazer login'}
      </Button>
    </div>
  );
}

export default InstagramIntegracao;

'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { saveSession } from '@/services/session';
import { Button } from '@/components/ui/button';

export default function FormLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const [session, error] = await authService.auth.login(email, password);
      if (error || !session) throw new Error(error?.message || 'Não foi possível entrar.');
      saveSession(session);
      const admin = session.profile === 'autopilot';
      const defaultPath = admin ? '/backoffice/app/dashboard' : '/app/dashboard';
      const requested = params.get('redirect');
      const allowed =
        requested?.startsWith(admin ? '/backoffice/app/' : '/app/') && !requested.includes('\\');
      router.replace(allowed ? requested! : defaultPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-5 mt-6">
      <label className="flex flex-col gap-2 font-medium">
        E-mail
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border bg-white p-3"
        />
      </label>
      <label className="flex flex-col gap-2 font-medium">
        Senha
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border bg-white p-3"
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar no AutoPilot CRM'}
      </Button>
      <Link href="/auth/forgot-password" className="text-center text-sm text-primary">
        Esqueci minha senha
      </Link>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem acesso? Entre em contato com o AutoPilot para contratar.
      </p>
    </form>
  );
}

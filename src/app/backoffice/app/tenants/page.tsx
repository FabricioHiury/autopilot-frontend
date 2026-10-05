'use client';
import { useEffect, useState } from 'react';
import {
  backofficeService,
  type TenantList,
  type RegisterTenantInput,
} from '@/services/backoffice.service';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
const empty: RegisterTenantInput = {
  name: '',
  assignee: '',
  taxId: '',
  email: '',
  password: '',
  state: '',
  city: '',
};
export default function TenantsPage() {
  const [data, setData] = useState<TenantList | null>(null),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [creating, setCreating] = useState(false),
    [form, setForm] = useState(empty),
    [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    try {
      setData(await backofficeService.listStores({ page, search: query, itemsByPage: 20 }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as lojas.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [page, query]);
  async function register(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await backofficeService.registerStore({ ...form, taxId: form.taxId.replace(/\D/g, '') });
      setCreating(false);
      setForm(empty);
      await load();
      toast.success('Loja cadastrada. O responsável receberá o e-mail de confirmação.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível cadastrar a loja.');
    } finally {
      setSaving(false);
    }
  }
  async function configure(id: string) {
    setSaving(true);
    try {
      await backofficeService.configureWhatsapp(id);
      await load();
      toast.success('WhatsApp habilitado para conexão pela loja.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível habilitar.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="p-6 lg:p-10">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Concessionárias</h1>
        <Button onClick={() => setCreating(true)}>Cadastrar loja</Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}
        className="flex gap-3 my-6"
      >
        <input
          aria-label="Pesquisar lojas"
          placeholder="Nome ou CNPJ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-3 bg-white"
        />
        <Button type="submit" variant="outline">
          Pesquisar
        </Button>
      </form>
      {error && (
        <div role="alert" className="mb-4">
          {error}{' '}
          <button onClick={() => void load()} className="text-primary">
            Tentar novamente
          </button>
        </div>
      )}
      {loading ? (
        <p>Carregando lojas…</p>
      ) : (
        <div className="overflow-auto bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Loja</th>
                <th className="p-4">CNPJ</th>
                <th className="p-4">Responsável</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {data?.stores.map((store) => (
                <tr key={store.id} className="border-b">
                  <td className="p-4 font-semibold">{store.companyName}</td>
                  <td className="p-4">{store.taxId}</td>
                  <td className="p-4">{store.email}</td>
                  <td className="p-4">
                    {store.wppConfigured ? (
                      'Habilitado'
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => configure(store.id)}
                      >
                        Habilitar conexão
                      </Button>
                    )}
                  </td>
                  <td className="p-4">{new Date(store.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.stores.length && <p className="p-6">Nenhuma loja encontrada.</p>}
        </div>
      )}
      <div className="flex gap-4 items-center mt-6">
        <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page <= 1 || loading}>
          Anterior
        </Button>
        <span>
          Página {page} de {Math.max(1, data?.totalPages || 1)}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={loading || page >= (data?.totalPages || 1)}
        >
          Próxima
        </Button>
      </div>
      {creating && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Cadastrar loja"
        >
          <form
            onSubmit={register}
            className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto space-y-4"
          >
            <h2 className="text-xl font-bold">Cadastrar concessionária</h2>
            {(
              [
                ['name', 'Nome da loja'],
                ['assignee', 'Nome do administrador da loja'],
                ['taxId', 'CNPJ'],
                ['email', 'E-mail do administrador'],
                ['password', 'Senha inicial'],
                ['state', 'UF'],
                ['city', 'Cidade'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label}
                <input
                  required
                  type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                  minLength={key === 'password' ? 8 : undefined}
                  maxLength={key === 'state' ? 2 : undefined}
                  autoComplete={key === 'password' ? 'new-password' : 'off'}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: key === 'state' ? e.target.value.toUpperCase() : e.target.value,
                    })
                  }
                  className="block border rounded-lg p-3 w-full mt-1"
                />
              </label>
            ))}
            <p className="text-xs text-muted-foreground">
              A senha deve conter maiúsculas, minúsculas, número e símbolo. O administrador
              precisará confirmar seu e-mail.
            </p>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Cadastrando…' : 'Cadastrar'}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={saving}
                onClick={() => {
                  setCreating(false);
                  setForm(empty);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

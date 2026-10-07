'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { backofficeService, type TenantList } from '@/services/backoffice.service';
export default function Dashboard() {
  const [data, setData] = useState<TenantList | null>(null),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    backofficeService
      .listStores({ itemsByPage: 6 })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);
  return (
    <main className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Administração AutoPilot</h1>
      <p className="text-muted-foreground mt-2">
        Gerencie concessionárias, administradores e atendimento.
      </p>
      <div className="grid md:grid-cols-3 gap-4 my-8">
        {[
          ['Concessionárias', '/backoffice/app/tenants'],
          ['Administradores', '/backoffice/app/access'],
          ['Chamados de suporte', '/backoffice/app/tickets'],
        ].map(([label, url]) => (
          <Link
            key={url}
            href={url}
            className="bg-white rounded-xl border p-6 font-semibold hover:border-primary"
          >
            {label} →
          </Link>
        ))}
      </div>
      <h2 className="font-bold text-lg">Concessionárias cadastradas</h2>
      {error ? (
        <p className="mt-4">{error}</p>
      ) : !data ? (
        <p className="mt-4">Carregando…</p>
      ) : (
        <ul className="mt-4 bg-white border rounded-xl divide-y">
          {data.stores.map((store) => (
            <li key={store.id} className="p-4 flex justify-between">
              <span>{store.companyName}</span>
              <span className="text-muted-foreground text-sm">{store.email}</span>
            </li>
          ))}
          {!data.stores.length && <li className="p-4">Nenhuma concessionária cadastrada.</li>}
        </ul>
      )}
    </main>
  );
}

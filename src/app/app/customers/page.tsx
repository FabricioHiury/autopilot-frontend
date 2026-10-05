'use client';

import Pagination from '@/components/commons/pagination/Pagination';
import CustomersHeader from '@/components/sections/customers/CustomersHeader';
import CustomersList from '@/components/sections/customers/CustomersList';
import { useObserver } from '@/contexts/observer.context';
import api from '@/utils/classes/api';
import { CustomerType, UserType } from '@/types/customer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';

export default function CustomerPage() {
  const padding = 'px-8';

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [checkingPermission, setCheckingPermission] = useState<boolean>(true);
  const [canCreateEdit, setCanCreateEdit] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [search, setSearch] = useState<string>('');

  const [usersHead, setUsersHead] = useState<UserType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentSignups, setRecentSignups] = useState<number>(0);

  const [filters, setFilters] = useState<{
    period: { from: Date | null; to: Date | null };
    gender?: string;
    state?: string;
    channelOrigin?: string;
  }>({
    period: { from: null, to: null },
    gender: undefined,
    state: undefined,
    channelOrigin: undefined,
  });

  const appAuth = useAppAuth();
  const { observer } = useObserver();

  const checkPermission = useCallback(async () => {
    setCheckingPermission(true);
    const access = await appAuth.fetchPermissions();
    const allowed = !!access && access.permissions.includes(StorePermission.STORE_SEARCH_CUSTOMERS);
    setHasPermission(allowed);
    setCanCreateEdit(
      !!access && access.permissions.includes(StorePermission.STORE_REGISTER_EDIT_CUSTOMERS),
    );
    setCheckingPermission(false);
  }, [appAuth]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const queryParams = useMemo(() => {
    const from = filters.period.from?.toISOString().split('T')[0] ?? null;
    const to = filters.period.to?.toISOString().split('T')[0] ?? null;

    return {
      page: page,
      limit: limit,
      search: search,
      dataStart: from,
      dataEnd: to,
      gender: filters.gender,
      state: filters.state,
      channelOrigin: filters.channelOrigin,
    };
  }, [page, limit, search, filters]);

  const listCustomers = useCallback(async () => {
    if (!hasPermission) return;

    setLoading(true);
    try {
      const [response, error] = await api.get(
        '/customers/list' + api.query.searchInMemoryQuerys(queryParams),
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      const data = response.data;
      setTotalPages(data.totalPages);
      setCustomers(data.customers);
      setRecentSignups(data.registrationsRecent);
      setTotalCustomers(data.totalCustomers);

      if (data.customers.length >= usersHead.length) {
        setUsersHead(
          data.customers.map((c: CustomerType): UserType => ({
            id: c.id,
            name: c.name,
            icon: c.avatarUrl,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [hasPermission, queryParams]);

  useEffect(() => {
    if (hasPermission) {
      listCustomers();
    }
  }, [hasPermission, listCustomers]);

  useEffect(() => {
    if (!hasPermission) return;

    if (observer.type === 'filtrosAtualizados') {
      setPage(1);
    } else if (observer.type === 'atualizarDadosClientes') {
      listCustomers();
    }
  }, [observer, hasPermission, listCustomers]);

  if (checkingPermission) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingGlobal />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <NoData label="Você não tem permissão para acessar essa página." />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-12 max-w-full md:h-[97.3svh] overflow-hidden relative">
      <CustomersHeader
        filters={filters}
        setFilters={setFilters}
        padding={padding + ' p-6 pt-9'}
        users={usersHead}
        search={search}
        setSearch={setSearch}
        recentSignups={recentSignups}
        total={totalCustomers}
      />

      {loading ? (
        <div className="flex w-full h-full justify-center items-center">
          <LoadingGlobal />
        </div>
      ) : (
        <CustomersList
          customers={customers}
          className={padding + (totalPages === 0 ? ' hidden' : '')}
          canEditCustomers={canCreateEdit}
        />
      )}

      <div
        className={
          'flex w-full justify-center items-center h-full -translate-y-20 ' +
          (totalPages === 0 ? 'flex' : 'hidden')
        }
      >
        <NoData />
      </div>

      <div className={'flex p-4 lg:p-0 ' + (totalPages === 0 ? 'hidden' : '')}>
        <Pagination
          background="bg-white"
          padding={padding + ' p-4 rounded-xl lg:rounded-none '}
          totalPages={totalPages}
          setLimitItens={setLimit}
          limitItens={limit}
          limitNumberPages={2}
          label="Clientes"
          setPage={setPage}
          page={page}
          total={totalCustomers}
          currentLength={customers.length}
        />
      </div>
    </main>
  );
}

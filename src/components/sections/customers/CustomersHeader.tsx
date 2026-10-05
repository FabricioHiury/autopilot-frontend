import Search from '@/components/inputs/search/Search';
import CalendarSelect from '@/components/inputs/select/CalendarSelect';
import FilterSelect from '@/components/inputs/select/FilterSelect';
import IconImage from '@/components/ui/IconImage';
import { UserType } from '@/types/customer';
import ButtonAdd from '@/components/commons/buttons/button-add';
import { useObserver } from '@/contexts/observer.context';
import { useCallback, useEffect, useState } from 'react';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';
import toast from 'react-hot-toast';
import { DateRange } from 'react-day-picker';
import AvatarList from './AvatarList';

interface Period {
  from: Date | null;
  to: Date | null;
}

interface Filters {
  period: Period;
  gender?: string;
  state?: string;
  channelOrigin?: string;
}

interface CustomersHeaderProps {
  users: UserType[];
  padding: string;
  search: string;
  setSearch: (value: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filters: Filters;
  recentSignups: number;
  total: number;
}

const CustomersHeader: React.FC<CustomersHeaderProps> = ({
  users,
  padding,
  search,
  setSearch,
  setFilters,
  filters,
  total,
  recentSignups,
}) => {
  const [canCreateEdit, setCanCreateEdit] = useState<boolean>(false);
  const [checkingPermission, setCheckingPermission] = useState<boolean>(true);

  const { setObserver } = useObserver();
  const appContext = useAppAuth();

  const checkPermission = useCallback(async () => {
    setCheckingPermission(true);
    const access = await appContext.fetchPermissions();
    if (!access) {
      setCanCreateEdit(false);
      setCheckingPermission(false);
      return;
    }
    setCanCreateEdit(access.permissions.includes(StorePermission.STORE_REGISTER_EDIT_CUSTOMERS));
    setCheckingPermission(false);
  }, [appContext]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const notifyFiltersUpdated = useCallback(
    (nextFilters: Filters) => {
      setObserver({
        type: 'filtrosAtualizados',
        data: nextFilters,
      });
    },
    [setObserver],
  );

  const handleFilterChange = useCallback(
    (filters: { gender?: string; state?: string; channelOrigin?: string; searchTerm?: string }) => {
      setFilters((old) => {
        const next: Filters = {
          ...old,
          gender: filters.gender,
          state: filters.state,
          channelOrigin: filters.channelOrigin,
        };
        notifyFiltersUpdated(next);
        return next;
      });

      if (filters.searchTerm !== undefined) {
        setSearch(filters.searchTerm);
      }
    },
    [notifyFiltersUpdated, setFilters, setSearch],
  );

  const handleSearch = useCallback(async () => {
    await handleFilterChange({ searchTerm: search });
  }, [handleFilterChange, search]);

  const handleAddCustomer = useCallback(() => {
    if (!canCreateEdit) {
      toast.error('Você não possui permissão para cadastrar clientes.');
      return;
    }
    setObserver({
      type: 'abrirPopClienteNovo',
      data: {},
    });
  }, [canCreateEdit, setObserver]);

  const updatePeriodAndSearch = useCallback(
    (value: DateRange | undefined) => {
      const normalized: Period = {
        from: value?.from ?? null,
        to: value?.to ?? null,
      };
      setFilters((old) => ({ ...old, period: normalized }));
      handleSearch();
    },
    [handleSearch, setFilters],
  );

  return (
    <div className={padding + ' bg-white'}>
      {/* Mobile */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex justify-between items-center gap-2">
          <h1 className="text-[#1B263A] text-[28px] font-semibold">Seus clientes AutoPilot</h1>
          <div className="flex items-center gap-2">
            <IconImage
              background="#1B263A"
              icon="/icons/plus_button.svg"
              onClick={handleAddCustomer}
            />
            <CalendarSelect
              range={{
                from: filters.period.from ?? undefined,
                to: filters.period.to ?? undefined,
              }}
              setRange={updatePeriodAndSearch}
            />
            <IconImage icon="/icons/share.svg" />
          </div>
        </div>
        <div className="flex justify-between gap-4 items-center">
          <FilterSelect
            onChange={handleFilterChange}
            values={{
              gender: filters.gender,
              state: filters.state,
              channelOrigin: filters.channelOrigin,
            }}
          />
          <Search
            placeholder="Procurar em clientes"
            value={search}
            setValue={setSearch}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex justify-between gap-10">
        <h1 className="text-[#1B263A] text-[28px] font-semibold">Seus clientes AutoPilot</h1>
        <div className="flex flex-grow items-center gap-2">
          <Search
            placeholder="Procurar em clientes"
            value={search}
            setValue={setSearch}
            onSearch={handleSearch}
          />
          <CalendarSelect
            range={{
              from: filters.period.from ?? undefined,
              to: filters.period.to ?? undefined,
            }}
            setRange={updatePeriodAndSearch}
          />
          <FilterSelect
            onChange={handleFilterChange}
            values={{
              gender: filters.gender,
              state: filters.state,
              channelOrigin: filters.channelOrigin,
            }}
          />
        </div>
      </div>

      <div className="flex lg:gap-4 justify-between items-center w-full mt-5 gap-2">
        <div className="flex flex-col lg:gap-8 lg:flex-row">
          <div className="flex flex-col">
            <h3 className="text-[#7F8999] text-[0.75rem] font-normal">Cadastrados Recentemente</h3>
            <div className="flex gap-2 items-center">
              <h2 className="color-[hsl(var(--secondary))] text-[3rem] font-semibold">
                +{recentSignups}
              </h2>
              <div className="rounded-full w-3 h-3 flex-shrink-0 bg-[#24AE6C]"></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[#7F8999] text-[0.75rem] font-normal">Todos os clientes</h3>
            <AvatarList users={users} total={total} />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {!checkingPermission && (
            <ButtonAdd
              title="Adicionar novo Cliente"
              onClick={handleAddCustomer}
              disabled={!canCreateEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersHeader;

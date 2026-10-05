import { IconCarIn } from '@/components/icons/icon-car-in';
import CardServiceMini from './card-service-mini';
import FilterButton from './filter-button';
import { IconCarOut } from '@/components/icons/icon-car-out';
import { IconCar } from '@/components/icons/icon-car';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/utils/classes/api';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';

interface EmployeeList {
  id: string;
  storeId: string;
  userId: string;
  photoUrl: number | null;
  name: string;
  taxId: string;
  whatsapp: string;
  phoneAdditional: string | null;
  status: string;
  notes: string;
  createdAt: string; // ou Date, caso você parse datas
  updatedAt: string; // ou Date, caso você parse datas
}

interface AtendimentoResponsavel {
  id: string;
  dealId: string;
  employeeId: string;
  storeId: string;
  createdAt: string; // ou Date
  updatedAt: string; // ou Date
  employee: EmployeeList;
}

export interface AtendimentoDashboard {
  id: string;
  storeId: string;
  customerId: number | null;
  temporaryCustomerId: number | null;
  dealOrigin: string;
  temperature: string;
  dealMode: string;
  status: string;
  title: string;
  descriptionDeal: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  dealAssignee: AtendimentoResponsavel[];
  customer?: {
    id: string;
    name: string;
  };
  temporaryCustomer?: {
    id: string;
    name: string;
  };
}

type DadosAtendimentos = {
  mode: string;
  deals: AtendimentoDashboard[];
};

export default function SectionLastServices() {
  const [data, setData] = useState<DadosAtendimentos>();
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setModo] = useState<string>('SELL');

  async function load() {
    setLoading(true);
    const [response, error] = await api.get(
      `/store/dashboard/last-deals${api.query.searchInMemoryQuerys({
        mode,
      })}`,
    );
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    setLoading(false);
    setData(response.data);
  }

  useEffect(() => {
    load();
  }, [mode]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[hsl(var(--secondary))] font-semibold text-[1.125rem]">
          Últimos atendimentos
        </h2>
        <div className="flex items-center justify-end gap-2">
          <FilterButton
            onClick={() => setModo('BUY')}
            title="Compra"
            icon={<IconCarIn />}
            active={mode === 'BUY'}
          />
          <FilterButton
            onClick={() => setModo('SELL')}
            title="Venda"
            icon={<IconCarOut />}
            active={mode === 'SELL'}
          />
          <FilterButton
            onClick={() => setModo('CONSIGNMENT')}
            title="Consignado"
            icon={<IconCar />}
            active={mode === 'CONSIGNMENT'}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl w-full relative mt-4">
        {(loading || !data) && (
          <div className="w-full flex justify-center items-center p-4">
            <LoadingGlobal minH="min-h-[130px]" />
          </div>
        )}
        {!loading && data && (
          <div className="p-4 w-full flex gap-4 overflow-x-auto min-h-[60px] scroll-padrao">
            {data.deals.map((obj, i) => {
              return <CardServiceMini deal={obj} />;
            })}
            {data.deals.length === 0 && (
              <p className="text-neutral-700 text-[12px] gap-1  flex items-center ">
                Nenhum atendimento para{' '}
                <b>"{mode === 'BUY' ? 'compras' : mode === 'SELL' ? 'vendas' : 'consignados'}" </b>
                encontrado
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

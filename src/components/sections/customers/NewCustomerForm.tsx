import ButtonDefault from '@/components/inputs/buttons/ButtonDefault';
import ButtonIcon from '@/components/inputs/buttons/ButtonIcon';
import Ratio from '@/components/inputs/ratio/Ratio';
import Select from '@/components/inputs/select/Select';
import Input from '@/components/inputs/text/Input';
import ImageInput from '@/components/inputs/media/ImageInput';
import { useObserver } from '@/contexts/observer.context';
import api from '@/utils/classes/api';
import handleDate from '@/utils/classes/format/time';
import sanitizar from '@/utils/classes/sanitizer/sanitizer';
import { states } from '@/utils/mock/states';
import { Customer } from '@/types/customer-details';
import { optionType } from '@/types/customer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ZodError, z } from 'zod';
import axios from 'axios';
import { TextareaComLabel } from '@/components/commons/inputs/textarea-com-label';
import { customerSchema } from '@/lib/client.schema';

interface NewCustomerFormProps {
  onNewCustomer?: (payload?: unknown) => void;
  onExitPop: () => void;
  data?: Customer;
  editing?: boolean;
}

const personTypeOptions: optionType[] = [
  { name: 'CPF', value: 'individual' },
  { name: 'CNPJ', value: 'legalEntity' },
];

const foreignerOptions: optionType[] = [
  { name: 'Não', value: 'nao' },
  { name: 'Sim', value: 'sim' },
];

const genderOptions: optionType[] = [
  { name: 'Masculino', value: 'masculino' },
  { name: 'Feminino', value: 'feminino' },
];

const initialForm = {
  name: '',
  birthDate: '',
  identityNumber: '',
  taxId: '',
  phone: '',
  whatsapp: '',
  email: '',
  postalCode: '',
  state: 'AC',
  notes: '',
  city: '',
  address: '',
  district: '',
  number: '',
  complement: '',
  typePerson: 'individual',
  foreigner: 'nao',
  gender: 'masculino',
};

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
  onExitPop,
  onNewCustomer,
  data,
  editing,
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState<File>();
  const { setObserver } = useObserver();

  function updateField(value: string, key: keyof typeof initialForm) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function loadAddressByCep(postalCode: string) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${postalCode}/json/`);
      const data = response.data;
      if (data.erro) return;

      setForm((prev) => ({
        ...prev,
        district: data.district,
        city: data.localidade,
        state: data.state,
        address: data.logradouro,
      }));
    } catch {
      // Silencia erros de CEP
    }
  }

  useEffect(() => {
    if (editing) loadExistingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!editing) setForm(initialForm);
  }, [editing]);

  function loadExistingData() {
    if (!data) return;

    const next = {
      name: data.name || '',
      birthDate: handleDate.formatISODate(data.birthDate) || '',
      identityNumber: sanitizar.identityNumber(data.identityNumber) || '',
      taxId: sanitizar.cpfcnpj(data.taxId) || '',
      phone: sanitizar.phone(data.phone, false) || '',
      whatsapp: sanitizar.phone(data.whatsapp, false) || '',
      email: data.email || '',
      postalCode: sanitizar.postalCode(data.customerAddress.postalCode) || '',
      state: data.customerAddress.state?.toUpperCase() || '',
      city: data.customerAddress.city || '',
      address: data.customerAddress.address || '',
      district: data.customerAddress.district || '',
      number: data.customerAddress.number || '',
      complement: data.customerAddress.complement || '',
      typePerson: data.typePerson || 'individual',
      foreigner: data.foreigner ? 'sim' : 'nao',
      notes: data.notes ?? '',
      gender: data.gender[0].toUpperCase() === 'M' ? 'masculino' : 'feminino',
    };

    setForm(next as typeof initialForm);
  }

  async function createCustomer() {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const error = parsed.error as ZodError;
      return toast.error(error.errors[0].message);
    }

    setLoading(true);
    try {
      if (parsed.data.email?.length === 0) {
        delete parsed.data.email;
      }

      const [response, error] = await api.post('/customers/create', parsed.data);
      if (error) {
        toast.error(error.message);
        return;
      }

      const newId = response?.data?.id;
      if (file && newId) {
        await uploadAttachment(newId, file);
      }

      setObserver({ type: 'atualizarDadosClientes', data: {} });
      setForm(initialForm);
      onNewCustomer?.(response?.data);
      onExitPop();
      toast.success('Cliente cadastrado com sucesso');
    } finally {
      setLoading(false);
    }
  }

  async function updateCustomer() {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const error = parsed.error as ZodError;
      return toast.error(error.errors[0].message);
    }

    setLoading(true);
    try {
      const [response, error] = await api.put(`/customers/edit/${data?.id}`, parsed.data);
      if (error) {
        toast.error(error.message);
        return;
      }
      setObserver({ type: 'atualizarDadosClientes', data: {} });
      setForm(initialForm);
      onNewCustomer?.(response?.data);
      onExitPop();
      toast.success('Cliente editado com sucesso');
    } finally {
      setLoading(false);
    }
  }

  async function uploadAttachment(id: string, f: File) {
    const fd = new FormData();
    fd.append('file', f);
    const [response, error] = await api.formData(`/customers/attachment/${id}`, fd, 'POST');
    return { response, error };
  }

  async function handleUploadImage(f: File) {
    setFile(f);
    if (editing === false) return;
    if (data?.id) await uploadAttachment(data.id, f);
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <p className="text-[#7F8999] text-[12px] w-full lg:w-[400px]">
          Preencha os dados e envie uma foto com o documento do cliente
        </p>
        <div className="flex gap-2 items-center w-full lg:w-[300px]">
          <ButtonDefault label="Enviar foto">
            <ImageInput
              accept=".pdf,.doc,.docx, .png, .jpg, .jpeg"
              onImageUpload={handleUploadImage}
            />
          </ButtonDefault>
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 pb-4">
        <Ratio
          onChange={(option) => updateField(option.value, 'typePerson')}
          label="O cadastro é no CPF ou no CNPJ"
          options={personTypeOptions}
          value={form.typePerson}
        />
        <Ratio
          onChange={(option) => updateField(option.value, 'foreigner')}
          label="O cliente é estrangeiro"
          options={foreignerOptions}
          value={form.foreigner}
        />
        <Ratio
          onChange={(option) => updateField(option.value, 'gender')}
          label="Selecione o gênero do cliente"
          options={genderOptions}
          value={form.gender}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mt-2">
        <Input
          flexLevel="flex-[2]"
          label="Nome Completo"
          placeholder="Seu nome"
          onChange={(e) => updateField(e.target.value, 'name')}
          value={form.name ?? ''}
        />
        <Input
          flexLevel="flex-[1]"
          label={form.typePerson === 'individual' ? 'Data de Nascimento' : 'Data de Fundação'}
          placeholder="00/00/0000"
          onChange={(e) => updateField(e.target.value, 'birthDate')}
          value={form.birthDate ?? ''}
          onSanitizar={(v) => sanitizar.data(v)}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Input
          flexLevel="flex-[1]"
          label="RG"
          placeholder="Insira o número do RG"
          value={form.identityNumber}
          onChange={(e) => updateField(e.target.value, 'identityNumber')}
        />
        <Input
          flexLevel="flex-[1]"
          label={form?.typePerson === 'individual' ? 'CPF' : 'CNPJ'}
          placeholder={form?.typePerson === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
          onChange={(e) => updateField(e.target.value, 'taxId')}
          value={form.taxId ?? ''}
          onSanitizar={(v) =>
            form?.typePerson === 'individual' ? sanitizar.cpf(v) : sanitizar.taxId(v)
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Input
          flexLevel="flex-[1]"
          label="Telefone"
          placeholder="(88) 9999-9999"
          value={form.phone ?? ''}
          onChange={(e) => updateField(e.target.value, 'phone')}
          onSanitizar={(v) => sanitizar.phone(v, false, 11)}
        />
        <Input
          flexLevel="flex-[1]"
          label="Whatsapp"
          placeholder="(88) 9999-9999"
          value={form.whatsapp ?? ''}
          onChange={(e) => updateField(e.target.value, 'whatsapp')}
          onSanitizar={(v) => sanitizar.phone(v, false, 11)}
        />
        <Input
          flexLevel="flex-[1]"
          label="Email"
          placeholder="Insira seu email"
          value={form.email ?? ''}
          onChange={(e) => updateField(e.target.value, 'email')}
        />
      </div>

      <TextareaComLabel
        label="Observações"
        placeholder="Insira os detalhes...."
        value={form.notes ?? ''}
        onChange={(v) => updateField(v, 'notes')}
      />

      <div className="flex flex-col">
        <h1 className="text-[hsl(var(--secondary))] text-xl font-semibold mt-4">
          Dados de Endereço
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Input
          flexLevel="flex-[1]"
          label="CEP"
          placeholder="00000-000"
          value={form.postalCode ?? ''}
          onChange={(e) => {
            const value = sanitizar.postalCode(e.target.value);
            updateField(value, 'postalCode');
            if (value.length === 9) {
              loadAddressByCep(value);
            }
          }}
          onSanitizar={(v) => sanitizar.postalCode(v)}
        />
        <Select
          flexLevel="flex-[1]"
          label="Estado"
          options={states}
          onChange={(opt) => updateField(opt.value, 'state')}
          value={form.state}
        />
        <Input
          flexLevel="flex-[1]"
          label="Municipio"
          placeholder="Insira o municipio"
          value={form.city}
          onChange={(e) => updateField(e.target.value, 'city')}
        />
      </div>

      <div className="flex">
        <Input
          label="Endereço"
          placeholder="Insira o endereço"
          onChange={(e) => updateField(e.target.value, 'address')}
          value={form.address}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Input
          flexLevel="flex-[1]"
          label="Numero"
          placeholder="231"
          onChange={(e) => updateField(e.target.value, 'number')}
          value={form.number ?? ''}
        />
        <Input
          flexLevel="flex-[1]"
          label="Complemento"
          placeholder="Insira o complemento"
          onChange={(e) => updateField(e.target.value, 'complement')}
          value={form.complement ?? ''}
        />
        <Input
          flexLevel="flex-[1]"
          label="Bairro"
          placeholder="Insira seu bairro"
          onChange={(e) => updateField(e.target.value, 'district')}
          value={form.district ?? ''}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mt-6">
        <ButtonIcon
          border="1px solid hsl(var(--secondary))"
          background="none"
          color="hsl(var(--secondary))"
          label="Cancelar"
          onClick={() => onExitPop()}
        />
        <ButtonIcon
          loading={loading}
          label={data ? 'Editar Cliente' : 'Cadastrar Cliente'}
          icon="/icons/check2.svg"
          onClick={() => {
            if (!editing) {
              createCustomer();
            } else {
              updateCustomer();
            }
          }}
        />
      </div>
    </div>
  );
};

export default NewCustomerForm;

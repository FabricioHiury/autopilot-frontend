'use client';

import { SelectPadrao } from '@/components/commons/inputs/select-padrao';
import { Label } from '@/components/commons/label';
import { PageTitle } from '@/components/commons/page-title';
import IconBgImageUpload from '@/components/icons/icon-bg-image-upload';
import IconCamera from '@/components/icons/icon-camera';
import { IconSave } from '@/components/icons/icon-save';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  StoreContact,
  StoreAddress,
  Store,
  contatoSchema,
  enderecoSchema,
} from '@/lib/store-schema';
import { getUserStorageId } from '@/lib/user.utils';
import api from '@/utils/classes/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { lojaSchema } from '@/lib/store-schema';
import Spinner from '@/components/loading/Spinner';
import { states } from '@/utils/mock/states';
import sanitizar from '@/utils/classes/sanitizer/sanitizer';
import Folder from '@/components/fold/Folder';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const InputRequired = () => (
  <div className="text-right">
    <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">(</span>
    <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
      *
    </span>
    <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
      ) Campos obrigatorios
    </span>
  </div>
);

function formatAddress(address: StoreAddress): string {
  const street = address.street || 'Não informado';
  const district = address.district || 'Não informado';
  const city = address.city || 'Não informado';
  const state = address.state || 'Não informado';
  const postalCode = address.postalCode || 'Não informado';

  return `Endereço: ${street} - Bairro: ${district} - Cidade: ${city} - Estado: ${state} - CEP: ${postalCode}`;
}

type CoupleButtonsProps = {
  loadingButton: boolean;
  onSave: Function;
  onClean: Function;
  labelRemove?: string;
  canRemove?: boolean;
};

function CoupleButtons({
  loadingButton,
  onSave,
  onClean,
  labelRemove,
  canRemove = true,
}: CoupleButtonsProps) {
  return (
    <>
      {canRemove && (
        <Button
          variant="outline"
          className="h-12 px-[1.875rem] border-[hsl(var(--secondary))]"
          onClick={() => onClean()}
        >
          {labelRemove ?? 'Limpar'}
        </Button>
      )}

      <Button
        className="flex items-center gap-2 h-12 px-[1.875rem]"
        onClick={() => onSave()}
        disabled={loadingButton}
      >
        {loadingButton ? (
          <Spinner color="white" width="18px" />
        ) : (
          <>
            <IconSave fill="#85A3DC" />
            <div className="text-[#f2f4f7] text-base font-semibold">Salvar</div>
          </>
        )}
      </Button>
    </>
  );
}

type LabelInputProps = {
  label: string;
  children: React.ReactNode;
  className: string;
};

function LabelInput({ label, children, className }: LabelInputProps) {
  return (
    <div
      className={'flex flex-col gap-1 justify-center items-start min-w-[250px]' + ' ' + className}
    >
      <Label>
        {label}
        <span className="text-[hsl(var(--primary))] text-[10px] font-semibold leading-3">*</span>
      </Label>
      {children}
    </div>
  );
}

type ContactProps = {
  contact: StoreContact;
  setContact: Function;
};

function Contact({ contact, setContact }: ContactProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[#283855] text-lg font-semibold leading-snug">Contato</div>
        <InputRequired />
      </div>

      <div className="flex flex-wrap gap-5  w-full">
        <LabelInput label="Seu nome" className="flex-[1]">
          <Input
            value={contact.name ?? ''}
            placeholder="Digite seu nome"
            onChange={(value) => {
              setContact({ ...contact, name: value.target.value });
            }}
          />
        </LabelInput>

        <LabelInput label="Celular" className="flex-[1]">
          <Input
            value={sanitizar.phone(contact.mobile ?? '', false, 11)}
            placeholder="Digite seu celular"
            onChange={(value) => {
              setContact({
                ...contact,
                mobile: sanitizar.phone(value.target.value, false, 11),
              });
            }}
          />
        </LabelInput>

        <LabelInput label="Telefone" className="flex-[1]">
          <Input
            value={sanitizar.phone(contact.phone ?? '', false, 11)}
            placeholder="Digite seu telefone"
            onChange={(value) => {
              setContact({
                ...contact,
                phone: sanitizar.phone(value.target.value, false, 11),
              });
            }}
          />
        </LabelInput>

        <LabelInput label="E-mail" className="flex-[2]">
          <Input
            value={contact.email ?? ''}
            placeholder="Digite seu e-mail"
            onChange={(value) => {
              setContact({
                ...contact,
                email: value.target.value,
              });
            }}
          />
        </LabelInput>

        <LabelInput label="Site" className="flex-[2]">
          <Input
            value={contact.site ?? ''}
            placeholder="Digite seu site"
            onChange={(value) => {
              setContact({
                ...contact,
                site: value.target.value,
              });
            }}
          />
        </LabelInput>
      </div>
    </>
  );
}

type AddressProps = {
  address: StoreAddress;
  setAddress: Function;
  index: number;
};

function Address({ address, setAddress, index }: AddressProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[#283855] text-lg font-semibold leading-snug">
          {index == 0 ? 'Endereço' : index + ': Endereço filial'}
        </div>
        <InputRequired />
      </div>
      <div className="flex flex-wrap gap-5 w-full">
        <LabelInput label="CEP" className="flex-[1]">
          <Input
            value={address.postalCode ?? ''}
            placeholder="Digite seu CEP"
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  postalCode: sanitizar.postalCode(value.target.value),
                },
                index,
              );
            }}
          />
        </LabelInput>

        <LabelInput label="UF" className="flex-[1]">
          <SelectPadrao
            value={address.state ?? 'AC'}
            options={states.map((obj) => ({
              value: obj.value,
              label: obj.name,
            }))}
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  state: value ?? '',
                },
                index,
              );
            }}
          />
        </LabelInput>

        <LabelInput label="Cidade" className="flex-[1]">
          <Input
            value={address.city ?? ''}
            placeholder="Nome da cidade"
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  city: value.target.value,
                },
                index,
              );
            }}
          />
        </LabelInput>

        <LabelInput label="Rua" className="flex-[3]">
          <Input
            value={address.street ?? ''}
            placeholder="Nome da rua"
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  street: value.target.value,
                },
                index,
              );
            }}
          />
        </LabelInput>

        <LabelInput label="Numero" className="flex-[1]">
          <Input
            value={address.number?.toString() ?? ''}
            placeholder="Número"
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  number: sanitizar.number(value.target.value),
                },
                index,
              );
            }}
          />
        </LabelInput>

        <LabelInput label="Bairro" className="flex-[2]">
          <Input
            value={address.district ?? ''}
            placeholder="Nome do Bairro"
            onChange={(value) => {
              setAddress(
                {
                  ...address,
                  district: value.target.value,
                },
                index,
              );
            }}
          />
        </LabelInput>
      </div>

      <div className="flex w-full rounded-lg text-[14px] items-center gap-2 px-2 p-1 leading-5 text-[#485B80] bg-[#EBEEF2] mt-4 mb-1">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="flex-shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_91_59377)">
            <path
              d="M2.5 17.4999V6.66659L10 3.33325L17.5 6.66659V17.4999"
              stroke="#485B80"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.833 10.8333H14.1663V17.4999H5.83301V12.4999H10.833"
              stroke="#485B80"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.8333 17.5001V10.0001C10.8333 9.77907 10.7455 9.56711 10.5893 9.41083C10.433 9.25455 10.221 9.16675 10 9.16675H8.33333C8.11232 9.16675 7.90036 9.25455 7.74408 9.41083C7.5878 9.56711 7.5 9.77907 7.5 10.0001V12.5001"
              stroke="#485B80"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_91_59377">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="translate-y-[1px]">{formatAddress(address)}</span>
      </div>
    </>
  );
}

function LogoUpload({ photoUrl }: { photoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(photoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Formato de arquivo inválido. Use JPG, JPEG, PNG ou WEBP.');
      if (inputRef.current) inputRef.current.value = '';

      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Arquivo muito grande. Máximo de 5MB.');
      if (inputRef.current) inputRef.current.value = '';

      return;
    }

    revokePreview();
    const localUrl = URL.createObjectURL(file);
    previewUrlRef.current = localUrl;
    setImage(localUrl);

    try {
      setIsUploading(true);
      const userId = getUserStorageId();
      if (!userId) throw new Error('Usuário não identificado.');

      const formData = new FormData();
      formData.append('file', file);

      const [response, error] = await api.uploadFile(`/store/update-logo`, formData, 'POST');

      if (error) {
        throw new Error(error.message);
      }

      if (response?.url) {
        revokePreview();
        setImage(response.url);
      } else {
        setImage(response.url);
      }

      toast.success('Imagem atualizada com sucesso!');
    } catch (e: any) {
      setImage(photoUrl);
      toast.error(e?.message || 'Erro ao enviar imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex items-center gap-2 max-w-[20rem]">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="relative w-[4rem] rounded-full h-[4rem] flex-grow-0 flex-shrink-0"
        type="button"
      >
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#F2F4F7] rounded-full">
            <Spinner color="hsl(var(--secondary))" width="24px" />
          </div>
        ) : image ? (
          <div className="w-full h-full">
            <img
              src={image}
              className="rounded-full overflow-hidden w-full h-full object-cover"
              alt="Logo da empresa"
              draggable={false}
            />
          </div>
        ) : (
          <div className="bg-[#F2F4F7] z-[2] border border-white w-[4rem] h-[4rem] rounded-full flex items-center justify-center relative shrink-0">
            <IconBgImageUpload />
            <div className="bg-[#E3EBF3] border border-white w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center absolute -bottom-[0.375rem] right-0">
              <IconCamera />
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="absolute hidden"
          disabled={isUploading}
        />
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-[#24292e] text-lg font-semibold leading-snug hidden md:block">
          Insira a logo da sua marca
        </p>
        <p className="text-[#24292e] text-lg font-semibold leading-snug md:hidden">
          Adicionar foto
        </p>
        <div className="w-full flex items-center gap-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2.58203 9C2.58203 9.8618 2.75178 10.7152 3.08157 11.5114C3.41137 12.3076 3.89476 13.031 4.50414 13.6404C5.11353 14.2498 5.83697 14.7332 6.63317 15.063C7.42937 15.3928 8.28273 15.5625 9.14453 15.5625C10.0063 15.5625 10.8597 15.3928 11.6559 15.063C12.4521 14.7332 13.1755 14.2498 13.7849 13.6404C14.3943 13.031 14.8777 12.3076 15.2075 11.5114C15.5373 10.7152 15.707 9.8618 15.707 9C15.707 8.1382 15.5373 7.28484 15.2075 6.48864C14.8777 5.69244 14.3943 4.969 13.7849 4.35961C13.1755 3.75023 12.4521 3.26684 11.6559 2.93704C10.8597 2.60724 10.0063 2.4375 9.14453 2.4375C8.28273 2.4375 7.42937 2.60724 6.63317 2.93704C5.83697 3.26684 5.11353 3.75023 4.50414 4.35961C3.89476 4.969 3.41137 5.69244 3.08157 6.48864C2.75178 7.28484 2.58203 8.1382 2.58203 9Z"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.14453 6.8125V9.72917"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.14453 11.9165V11.9238"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="w-full text-[#657380] text-[0.625rem] font-normal leading-3">
            A resolução mínima indicada da imagem é de 120 x 56 pixels
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfigDataStorePage() {
  const [store, setStore] = useState<Store>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingBtnAddress, setLoadingBtnAddress] = useState<boolean>(false);
  const [loadingBtnStore, setLoadingBtnStore] = useState<boolean>(false);
  const [loadingBtnContact, setLoadingBtnContact] = useState<boolean>(false);
  const [positionFolder, setPositionFolder] = useState<number>(0);

  function setAddress(address: StoreAddress, index: number) {
    setStore((prevStore) => {
      if (!prevStore) {
        return prevStore;
      }
      return {
        ...prevStore,
        storeAddress: prevStore?.storeAddress.map((obj, i) => {
          if (i == index) {
            obj = address;
          }
          return obj;
        }),
      };
    });
  }

  function setContact(contact: StoreContact) {
    setStore((prevStore) => {
      if (!prevStore) {
        return prevStore;
      }
      return {
        ...prevStore,
        storeContact: [contact],
      };
    });
  }

  async function loadStore() {
    const [response, error] = await api.get('/store');
    if (error) {
      return toast.error(error.message);
    }
    setLoading(false);
    setStore(response.data);
  }

  async function saveContact() {
    const form = contatoSchema.safeParse(store?.storeContact[0]);
    if (!form.success) {
      return toast.error(form.error.issues[0].message);
    }

    setLoadingBtnContact(true);
    const [response, error] = await api.put('/store/contact', form.data);
    setLoadingBtnContact(false);

    if (error) {
      return toast.error(error.message);
    }

    return toast.success('Contato salvo com sucesso');
  }

  async function saveStore() {
    const form = lojaSchema.safeParse(store);
    if (!form.success) {
      return toast.error(form.error.issues[0].message);
    }

    setLoadingBtnStore(true);
    const [response, error] = await api.put('/store/edit', form.data);
    setLoadingBtnStore(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success('Dados da loja salvo com sucesso');
  }

  function onNewAddress() {
    if (!store) return;
    setStore((prevStore) => {
      if (prevStore?.storeAddress) {
        const novoEnderecoLoja = [
          ...prevStore.storeAddress,
          {
            id: '',
            storeId: '',
            postalCode: '',
            state: 'AC',
            city: '',
            street: '',
            number: '',
            district: '',
            complement: '',
            branch: false,
            createdAt: '',
            updatedAt: '',
          },
        ];

        return {
          ...prevStore,
          storeAddress: novoEnderecoLoja,
        };
      }
    });

    setPositionFolder(store?.storeAddress.length ?? 0);
  }

  async function deleteAddress(address: StoreAddress, pos: number) {
    setPositionFolder(0);
    setStore((prev: Store | undefined) => {
      if (!prev) return prev;
      return {
        ...prev,
        storeAddress: prev?.storeAddress.filter((end, i) => i !== pos),
      };
    });

    if (address.id) {
      api.delete(`/store/address/${address.id}`);
      return toast.success('Endereço excluido com sucesso');
    }
  }

  async function saveAddress(address: StoreAddress, pos: number) {
    if (!store) return;
    const form = enderecoSchema.safeParse(address);
    if (!form.success) {
      return toast.error(form.error.issues[0].message);
    }

    setLoadingBtnAddress(true);
    const [response, error] = await api.put(`/store/address`, form.data);
    setLoadingBtnAddress(false);

    if (error) {
      return toast.error(error.message);
    }

    setStore((prevStore: Store | undefined) => {
      if (!prevStore) return prevStore;
      return {
        ...prevStore,
        storeAddress: prevStore.storeAddress.map((obj, i) => {
          if (i === pos) {
            obj.id = response.data.id;
          }
          return obj;
        }),
      };
    });

    return toast.success(`Endereço em ${address.district} salvo com sucesso`, { duration: 1000 });
  }

  useEffect(() => {
    loadStore();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <LoadingGlobal />
      </div>
    );
  }
  if (!loading && store)
    return (
      <main className="px-4 pt-6 pb-[12rem] md:px-10 md:py-10 bg-[#FEFEFE]">
        <div className="w-full gap-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <PageTitle title="Dados da loja" />
          <LogoUpload photoUrl={store.photoUrl} />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-[#283855] text-lg font-semibold leading-snug">
              Dados da empresa
            </div>
            <InputRequired />
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <LabelInput className="flex-[4]" label="Nome Empresa">
              <Input
                value={store.companyName ?? ''}
                placeholder="Nome da Empresa"
                onChange={(value) => {
                  setStore({
                    ...store,
                    companyName: value.target.value,
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[1]" label="CNPJ">
              <Input
                value={store.taxId ?? ''}
                placeholder="CNPJ"
                onChange={(value) => {
                  setStore({
                    ...store,
                    taxId: sanitizar.taxId(value.target.value),
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[1]" label="Inscrição Municipal">
              <Input
                value={store.registrationMunicipal ?? ''}
                placeholder="Inscrição Municipal"
                onChange={(value) => {
                  setStore({
                    ...store,
                    registrationMunicipal: sanitizar.number(value.target.value),
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[2]" label="Inscrição Estadual">
              <Input
                value={store.registrationState ?? ''}
                placeholder="Inscrição Estadual"
                onChange={(value) => {
                  setStore({
                    ...store,
                    registrationState: sanitizar.number(value.target.value),
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[3]" label="Código de regime tributário">
              <SelectPadrao
                placeholder="Selecione"
                value={store.regimeTax}
                options={[
                  { label: 'Simples Nacional', value: '1' },
                  { label: 'Lucro Presumido', value: '2' },
                  { label: 'Lucro Real', value: '3' },
                ]}
                onChange={(value) => {
                  setStore({
                    ...store,
                    regimeTax: value ?? '',
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[1]" label="Portal da Empresa">
              <SelectPadrao
                placeholder="Selecione"
                value={store.portalCompany ?? undefined}
                options={[
                  { label: 'MEI', value: '1' },
                  { label: 'ME', value: '2' },
                  { label: 'EPP', value: '3' },
                  { label: 'LTDA', value: '4' },
                  { label: 'SA', value: '5' },
                ]}
                onChange={(value) => {
                  setStore({
                    ...store,
                    portalCompany: value ?? '',
                  });
                }}
              />
            </LabelInput>

            <LabelInput className="flex-[2]" label="Atividade Principal">
              <SelectPadrao
                placeholder="Selecione"
                value={store.activityPrimary ?? undefined}
                options={[
                  { label: 'Comércio', value: '1' },
                  { label: 'Indústria', value: '2' },
                  { label: 'Serviços', value: '3' },
                ]}
                onChange={(value) => {
                  setStore({
                    ...store,
                    activityPrimary: value ?? '',
                  });
                }}
              />
            </LabelInput>

            <LabelInput className=" w-full min-w-full" label="Descreva sua atividade">
              <Input
                value={store.descriptionActivity ?? ''}
                placeholder="Descreva aqui sua atividade"
                onChange={(value) => {
                  setStore({
                    ...store,
                    descriptionActivity: value.target.value,
                  });
                }}
              />
            </LabelInput>

            <div className="md:col-span-12 w-full flex items-center justify-end gap-4">
              <CoupleButtons
                loadingButton={loadingBtnStore}
                onSave={saveStore}
                onClean={() => {}}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex-col gap-5 flex">
          <Folder
            position={positionFolder}
            onNewFolder={onNewAddress}
            setPosition={setPositionFolder}
            folders={store.storeAddress.map((obj, i) => {
              if (i == 0) {
                return 'Endereço Principal';
              } else {
                return `${i}: Endereço Filial`;
              }
            })}
          />

          {store.storeAddress.map((end, i) => {
            if (i === positionFolder) {
              return (
                <div key={i}>
                  <Address address={end} setAddress={setAddress} index={i} />
                  <div
                    className={
                      (i === store.storeAddress.length - 1 && 'hidden') +
                      ' ' +
                      'w-full h-[1px] bg-gray-300 my-4'
                    }
                  ></div>
                </div>
              );
            }
          })}

          <div className="flex flex-wrap gap-12 justify-end items-center w-full">
            <div className="md:col-span-12 flex items-center justify-end gap-4">
              <CoupleButtons
                loadingButton={loadingBtnAddress}
                labelRemove="Excluir"
                canRemove={positionFolder !== 0}
                onSave={() => saveAddress(store.storeAddress[positionFolder], positionFolder)}
                onClean={() => deleteAddress(store.storeAddress[positionFolder], positionFolder)}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex-col gap-3 flex">
          <Contact contact={store.storeContact[0]} setContact={setContact} />
        </div>

        <div className="md:col-span-12 w-full flex items-center justify-end mt-4 gap-4">
          <CoupleButtons
            loadingButton={loadingBtnContact}
            onSave={saveContact}
            onClean={() => {
              setContact({
                ...store.storeContact[0],
                mobile: '',
                email: '',
                name: '',
                site: '',
                phone: '',
              });
            }}
          />
        </div>
      </main>
    );
}

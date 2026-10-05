import { useEffect, useRef, useState } from 'react';
import SelectTwo from './SelectTwo';

interface SelectOption {
  name: string;
  value: string;
}

interface FilterConfig {
  showGender?: boolean;
  showState?: boolean;
  showSourceChannel?: boolean;
  showStatus?: boolean;
  endpoint?: string;
  customFilters?: SelectOption[];
}

interface FilterSelectProps {
  onChange: (filters: {
    gender?: string;
    state?: string;
    channelOrigin?: string;
    status?: string;
    searchTerm?: string;
  }) => void;
  config?: FilterConfig;
  values?: {
    gender?: string;
    state?: string;
    channelOrigin?: string;
    status?: string;
    searchTerm?: string;
  };
}

const GENDER_OPTIONS: SelectOption[] = [
  { name: 'Masculino', value: 'masculino' },
  { name: 'Feminino', value: 'feminino' },
  { name: 'Outro', value: 'outro' },
];

const STATE_OPTIONS: SelectOption[] = [
  { name: 'AC', value: 'AC' },
  { name: 'AL', value: 'AL' },
  { name: 'AP', value: 'AP' },
  { name: 'AM', value: 'AM' },
  { name: 'BA', value: 'BA' },
  { name: 'CE', value: 'CE' },
  { name: 'DF', value: 'DF' },
  { name: 'ES', value: 'ES' },
  { name: 'GO', value: 'GO' },
  { name: 'MA', value: 'MA' },
  { name: 'MT', value: 'MT' },
  { name: 'MS', value: 'MS' },
  { name: 'MG', value: 'MG' },
  { name: 'PA', value: 'PA' },
  { name: 'PB', value: 'PB' },
  { name: 'PR', value: 'PR' },
  { name: 'PE', value: 'PE' },
  { name: 'PI', value: 'PI' },
  { name: 'RJ', value: 'RJ' },
  { name: 'RN', value: 'RN' },
  { name: 'RS', value: 'RS' },
  { name: 'RO', value: 'RO' },
  { name: 'RR', value: 'RR' },
  { name: 'SC', value: 'SC' },
  { name: 'SP', value: 'SP' },
  { name: 'SE', value: 'SE' },
  { name: 'TO', value: 'TO' },
];

const SOURCE_CHANNEL_OPTIONS: SelectOption[] = [
  { name: 'WhatsApp', value: 'whatsapp' },
  { name: 'Instagram', value: 'instagram' },
  { name: 'Facebook', value: 'facebook' },
  { name: 'OLX', value: 'olx' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { name: 'Ativo', value: 'active' },
  { name: 'Inativo', value: 'inactive' },
];

const FilterSelect: React.FC<FilterSelectProps> = ({ onChange, config = {}, values }) => {
  const inputContainerRef = useRef(null);
  const genderSelectRef = useRef(null);
  const stateSelectRef = useRef(null);
  const sourceChannelSelectRef = useRef(null);
  const statusSelectRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [gender, setGender] = useState<SelectOption | undefined>();
  const [state, setState] = useState<SelectOption | undefined>();
  const [status, setStatus] = useState<SelectOption | undefined>();
  const [sourceChannel, setSourceChannel] = useState<SelectOption | undefined>();

  function toggleDropdown() {
    setIsDropdownOpen((prev) => !prev);
  }

  function handleApplyFilters() {
    const filters: {
      gender?: string;
      state?: string;
      channelOrigin?: string;
      searchTerm?: string;
      status?: string;
    } = {};

    if (gender && 'value' in gender) {
      filters.gender = gender.value;
    }
    if (state && 'value' in state) {
      filters.state = state.value;
    }
    if (sourceChannel && 'value' in sourceChannel) {
      filters.channelOrigin = sourceChannel.value;
    }
    if (status && 'value' in status) {
      filters.status = status.value;
    }
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }

    onChange(filters);
    setIsDropdownOpen(false);
  }

  function handleClearFilters() {
    setGender(undefined);
    setState(undefined);
    setSourceChannel(undefined);
    setStatus(undefined);
    setSearchTerm('');

    onChange({});
    setIsDropdownOpen(false);
  }

  function handleSearch(term: string) {
    setSearchTerm(term);
  }

  function handleBlur(event: any) {
    if (!event) return;
    const element = event.relatedTarget;
    if (containerRef.current && !containerRef.current.contains(element)) {
      setIsDropdownOpen(false);
    } else if (
      containerRef.current &&
      element !== inputContainerRef.current &&
      element !== genderSelectRef.current &&
      element !== stateSelectRef.current &&
      element !== sourceChannelSelectRef.current
    ) {
      containerRef.current.focus();
    }
  }

  useEffect(() => {
    if (isDropdownOpen && containerRef) {
      containerRef.current?.focus();
    }
  }, [isDropdownOpen, containerRef]);

  // Sync from external values so filters remain selected when reopening
  useEffect(() => {
    if (!values) return;
    if (values.gender !== undefined) {
      setGender(GENDER_OPTIONS.find((g) => g.value === values.gender));
    }
    if (values.state !== undefined) {
      setState(STATE_OPTIONS.find((s) => s.value === values.state));
    }
    if (values.channelOrigin !== undefined) {
      setSourceChannel(SOURCE_CHANNEL_OPTIONS.find((c) => c.value === values.channelOrigin));
    }
    if (values.status !== undefined) {
      setStatus(STATUS_OPTIONS.find((s) => s.value === values.status));
    }
    if (values.searchTerm !== undefined) {
      setSearchTerm(values.searchTerm);
    }
  }, [values]);

  const {
    showGender = true,
    showState = true,
    showSourceChannel = true,
    showStatus = false,
  } = config;

  return (
    <div
      className={
        'flex flex-col flex-shrink-0 w-10 h-10 justify-center items-center rounded-lg gap-0 relative transition-all duration-200 z-50 ' +
        (isDropdownOpen ? 'bg-[hsl(var(--primary))]' : 'bg-[#F2F4F7]')
      }
      tabIndex={0}
      onBlur={handleBlur}
      ref={containerRef}
    >
      <button
        className="relative w-full h-full flex justify-center items-center gap-2 text-[#6C7788] focus:text-[#485B80]"
        onClick={toggleDropdown}
      >
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.6729 10.2541H7.23894M2.85008 10.2541H1.05469M2.85008 10.2541C2.85008 9.67991 3.08123 9.12922 3.49267 8.72319C3.90411 8.31716 4.46215 8.08906 5.04401 8.08906C5.62588 8.08906 6.18391 8.31716 6.59535 8.72319C7.00679 9.12922 7.23794 9.67991 7.23794 10.2541C7.23794 10.8283 7.00679 11.379 6.59535 11.785C6.18391 12.1911 5.62588 12.4192 5.04401 12.4192C4.46215 12.4192 3.90411 12.1911 3.49267 11.785C3.08123 11.379 2.85008 10.8283 2.85008 10.2541ZM19.6729 16.8158H13.8881M13.8881 16.8158C13.8881 17.3902 13.6564 17.9415 13.2449 18.3476C12.8334 18.7537 12.2752 18.9819 11.6932 18.9819C11.1114 18.9819 10.5533 18.7528 10.1419 18.3468C9.73044 17.9407 9.49929 17.39 9.49929 16.8158M13.8881 16.8158C13.8881 16.2415 13.6564 15.6912 13.2449 15.2851C12.8334 14.8789 12.2752 14.6508 11.6932 14.6508C11.1114 14.6508 10.5533 14.8789 10.1419 15.2849C9.73044 15.6909 9.49929 16.2416 9.49929 16.8158M9.49929 16.8158H1.05469M19.6729 3.6924H16.548M12.1592 3.6924H1.05469M12.1592 3.6924C12.1592 3.11819 12.3903 2.5675 12.8018 2.16147C13.2132 1.75545 13.7712 1.52734 14.3531 1.52734C14.6412 1.52734 14.9265 1.58334 15.1927 1.69215C15.4589 1.80095 15.7007 1.96043 15.9044 2.16147C16.1082 2.36252 16.2698 2.60119 16.38 2.86387C16.4903 3.12655 16.547 3.40808 16.547 3.6924C16.547 3.97672 16.4903 4.25826 16.38 4.52093C16.2698 4.78361 16.1082 5.02229 15.9044 5.22333C15.7007 5.42437 15.4589 5.58385 15.1927 5.69266C14.9265 5.80146 14.6412 5.85746 14.3531 5.85746C13.7712 5.85746 13.2132 5.62936 12.8018 5.22333C12.3903 4.8173 12.1592 4.26661 12.1592 3.6924Z"
            stroke={isDropdownOpen ? 'white' : 'black'}
            strokeWidth="1.74545"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <div
        className={
          'absolute top-[100%] flex flex-col gap-6 pointer-events-auto min-w-64 right-[0%] origin-right rounded-xl bg-[hsl(var(--secondary))] p-4 shadow-xl z-50 ' +
          (isDropdownOpen ? '' : 'hidden')
        }
      >
        <div className="grid grid-cols-2 gap-3 w-full p-1">
          {showGender && (
            <SelectTwo
              onBlur={handleBlur}
              focusAnother={() => containerRef.current?.focus()}
              label="Gênero"
              options={GENDER_OPTIONS}
              selectedOptions={gender}
              setSelectedOptions={setGender}
              selectContainer={genderSelectRef}
            />
          )}

          {showState && (
            <SelectTwo
              onBlur={handleBlur}
              focusAnother={() => containerRef.current?.focus()}
              label="Estado"
              options={STATE_OPTIONS}
              selectedOptions={state}
              setSelectedOptions={setState}
              selectContainer={stateSelectRef}
            />
          )}
        </div>

        {showSourceChannel && (
          <div className="grid grid-cols-2 gap-3 w-full p-1">
            <SelectTwo
              onBlur={handleBlur}
              focusAnother={() => containerRef.current?.focus()}
              label="Canal de Origem"
              options={SOURCE_CHANNEL_OPTIONS}
              selectedOptions={sourceChannel}
              setSelectedOptions={setSourceChannel}
              selectContainer={sourceChannelSelectRef}
            />

            {showStatus && (
              <SelectTwo
                onBlur={handleBlur}
                focusAnother={() => containerRef.current?.focus()}
                label="Status"
                options={STATUS_OPTIONS}
                selectedOptions={status}
                setSelectedOptions={setStatus}
                selectContainer={statusSelectRef}
              />
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center *:text-[14px]">
          <button className="text-white hover:underline" onClick={handleClearFilters}>
            Limpar Filtros
          </button>
          <button
            className="text-[#464F5F] font-semibold bg-white rounded-lg p-2 px-4"
            onClick={handleApplyFilters}
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSelect;

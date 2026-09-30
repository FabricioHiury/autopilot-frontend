'use client'
import ButtonBlueDefault from "@/components/inputs/buttons/ButtonBlueDefault";
import Pass from "@/components/inputs/password/Pass";
import Select from "@/components/inputs/select/Select";
import Input from "@/components/inputs/text/Input";
import api from "@/utils/classes/api";
import sanitizar from "@/utils/classes/sanitizer/sanitizer";
import validateInputs from "@/utils/classes/sanitizer/validate";
import { states } from "@/utils/mock/states";
import { fetchCompanyFromCnpj } from "@/utils/classes/cnpj/fetchCompanyFromCnpj";
import { fetchAddressFromCep } from "@/utils/classes/cep/fetchAddressFromCep";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, memo } from "react";
import toast from "react-hot-toast";
import TermsModal from "@/components/commons/modais/TermsModal";

function SignUpForm() {
    const router = useRouter();

    const [personType, setPersonType] = useState<'PF' | 'PJ'>('PJ');
    const [name, setName] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [fiscalDocument, setFiscalDocument] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [phone, setPhone] = useState('');
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [stateRegion, setStateRegion] = useState('DF');
    const [city, setCity] = useState('');
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const fetchCnpjData = useCallback(async (cnpj: string) => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsLoadingCnpj(true);

        try {
            const companyData = await fetchCompanyFromCnpj(cleanCnpj);

            if (companyData) {
                setName(companyData.nome);
                setCity(companyData.cidade);

                const foundState = states.find(est => est.value === companyData.estado);
                if (foundState) {
                    setStateRegion(foundState.value);
                }

                toast.success('Dados encontrados automaticamente!');
            } else {
                toast.error('CNPJ não encontrado na Receita Federal');
            }
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast.error('Erro ao buscar dados do CNPJ');
        } finally {
            setIsLoadingCnpj(false);
        }
    }, []);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }, []);

    const handleFiscalDocumentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const value = personType === 'PJ' ? sanitizar.cnpj(raw) : sanitizar.cpf(raw);
        setFiscalDocument(value);
        if (personType === 'PJ' && value.replace(/\D/g, '').length === 14) {
            fetchCnpjData(value);
        }
    }, [fetchCnpjData, personType]);

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    }, []);

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }, []);

    const handleEmailBlur = useCallback(() => {
        setEmailTouched(true);
    }, []);

    const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value);
    }, []);

    const handleStateChange = useCallback((option: any) => {
        setStateRegion(option.value);
    }, []);

    const handleTermsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsTermsModalOpen(true);
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
    }, []);

    const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCep(e.target.value);
    }, []);

    const fetchCepData = useCallback(async (cepValue: string) => {
        const clean = cepValue.replace(/\D/g, '');
        if (clean.length !== 8) return;

        setIsLoadingCep(true);
        try {
            const data = await fetchAddressFromCep(clean);
            if (data) {
                setStreet(data.endereco || '');
                setNeighborhood(data.bairro || '');
                setCity(data.municipio || '');
                const foundState = states.find(est => est.value === data.uf);
                if (foundState) setStateRegion(foundState.value);
                toast.success('Endereço preenchido automaticamente!');
            } else {
                toast.error('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            toast.error('Erro ao buscar dados do CEP');
        } finally {
            setIsLoadingCep(false);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!hasAcceptedTerms) {
            toast.error('Você deve aceitar os termos de uso para continuar');
            return;
        }
        if (!validateInputs.email(email)) {
            toast.error('Insira um email válido');
            return;
        }
        if (personType === 'PJ') {
            if (!validateInputs.cnpj(fiscalDocument)) {
                toast.error('Insira um CNPJ válido');
                return;
            }
            if (!validateInputs.string(name, 1)) {
                toast.error('Insira a razão social da sua empresa');
                return;
            }
        } else {
            if (!validateInputs.cpf(fiscalDocument)) {
                toast.error('Insira um CPF válido');
                return;
            }
            if (!validateInputs.string(name, 1)) {
                toast.error('Insira seu nome completo');
                return;
            }
        }
        if (!validateInputs.string(city, 1)) {
            toast.error('Insira o nome da sua cidade');
            return;
        }
        if (!validateInputs.telefone(phone)) {
            toast.error('Insira um telefone/WhatsApp válido');
            return;
        }
        if (!validateInputs.senhaForte(password)) {
            toast.error('Sua senha deve conter pelo menos: 1 caractere especial, letras maiusculas e minusculas, e pelo menos um numero');
            return;
        }
        if (!validateInputs.stringIgual(password, confirmPassword)) {
            toast.error('Senhas não são iguais');
            return;
        }

        setIsLoading(true);

        try {
            const formPost = {
                nome: name,
                documentoFiscal: fiscalDocument,
                senha: password,
                email,
                uf: stateRegion,
                cidade: city,
                responsavel: responsavel || undefined,
                telefone: phone || undefined,
                cep: cep || undefined,
                rua: street || undefined,
                numero: number || undefined,
                complemento: complement || undefined,
                bairro: neighborhood || undefined
            };

            const [response, error] = await api.post('/loja/cadastrar', formPost);
            if (error) {
                toast.error(error.message);
                setIsLoading(false);
                return;
            }

            toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
            router.replace('/autenticacao/login');
        } catch (err) {
            toast.error('Erro ao cadastrar loja, tente novamente');
            setIsLoading(false);
        }
    }, [hasAcceptedTerms, email, fiscalDocument, city, name, password, confirmPassword, stateRegion, router, responsavel, phone, cep, street, number, complement, neighborhood]);

    const handleTermsClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsTermsModalOpen(true);
    }, []);

    const handleAcceptTerms = useCallback(() => {
        setHasAcceptedTerms(true);
        setIsTermsModalOpen(false);
        toast.success('Termos aceitos com sucesso!');
    }, []);

    const handleCloseTermsModal = useCallback(() => {
        setIsTermsModalOpen(false);
    }, []);

    const TypeToggle = useMemo(() => (
        <div className="w-full flex items-center justify-between">
            <span className="text-sm text-[#485B80] font-semibold">Tipo de cadastro</span>
            <div className="flex items-center gap-3">
                <span className={`text-[12px] ${personType === 'PF' ? 'text-[#1B263A] font-semibold' : 'text-[#95A3B2]'}`}>Pessoa Física</span>
                <button
                    type="button"
                    aria-label="Alternar tipo de pessoa"
                    onClick={() => setPersonType(personType === 'PF' ? 'PJ' : 'PF')}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ${personType === 'PJ' ? 'bg-[#1B263A]' : 'bg-[#DCE3ED]'}`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${personType === 'PJ' ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
                <span className={`text-[12px] ${personType === 'PJ' ? 'text-[#1B263A] font-semibold' : 'text-[#95A3B2]'}`}>Pessoa Jurídica</span>
            </div>
        </div>
    ), [personType]);

    const DocumentRow = useMemo(() => (
        <div className="flex flex-col lg:flex-row justify-between gap-3">
            <Input
                label={personType === 'PJ' ? 'Razão social' : 'Nome completo'}
                placeholder={personType === 'PJ' ? 'Razão social da empresa' : 'Seu nome completo'}
                onChange={handleNameChange}
                value={name}
            />
            <Input
                label={personType === 'PJ' ? 'CNPJ' : 'CPF'}
                placeholder={personType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                onChange={handleFiscalDocumentChange}
                value={fiscalDocument}
                disabled={personType === 'PJ' && isLoadingCnpj}
            />
        </div>
    ), [handleNameChange, handleFiscalDocumentChange, name, fiscalDocument, isLoadingCnpj, personType]);

    const ResponsavelRow = useMemo(() => (
        personType === 'PJ' ? (
            <div className="flex flex-col lg:flex-row justify-between gap-3">
                <Input
                    label="Nome do responsável"
                    placeholder="Quem está criando a conta"
                    onChange={(e) => setResponsavel(e.target.value)}
                    value={responsavel}
                />
                <Input
                    label="Telefone comercial/WhatsApp"
                    placeholder="(00) 00000-0000"
                    onChange={handlePhoneChange}
                    onSanitizar={(v) => sanitizar.telefone(v, false)}
                    value={phone}
                />
            </div>
        ) : (
            <div className="flex flex-col lg:flex-row justify-between gap-3">
                <Input
                    label="Telefone/WhatsApp"
                    placeholder="(00) 00000-0000"
                    onChange={handlePhoneChange}
                    onSanitizar={(v) => sanitizar.telefone(v, false)}
                    value={phone}
                />
            </div>
        )
    ), [personType, responsavel, phone, handlePhoneChange]);

    const CepRow = useMemo(() => (
        <div className="flex flex-col lg:flex-row justify-between gap-3">
            <Input
                flexLevel="flex-[0.5]"
                label="CEP"
                placeholder="00000-000"
                onChange={(e) => { handleCepChange(e); fetchCepData(e.target.value); }}
                onSanitizar={(v) => sanitizar.cep(v)}
                value={cep}
                disabled={isLoadingCep}
            />
            <Input
                flexLevel="flex-[1.5]"
                label="Logradouro"
                placeholder="Rua, avenida..."
                onChange={(e) => setStreet(e.target.value)}
                value={street}
            />
        </div>
    ), [cep, street, isLoadingCep, handleCepChange, fetchCepData]);

    const AddressRow = useMemo(() => (
        <div className="flex flex-col lg:flex-row justify-between gap-3">
            <Input
                flexLevel="flex-[0.5]"
                label="Número"
                placeholder="Número"
                onChange={(e) => setNumber(e.target.value)}
                value={number}
            />
            <Input
                flexLevel="flex-[1.5]"
                label="Complemento"
                placeholder="Apartamento, sala, complemento"
                onChange={(e) => setComplement(e.target.value)}
                value={complement}
            />
        </div>
    ), [number, complement]);

    const NeighborhoodRow = useMemo(() => (
        <div className="flex flex-col lg:flex-row justify-between gap-3">
            <Input
                flexLevel="flex-[1]"
                label="Bairro"
                placeholder="Bairro"
                onChange={(e) => setNeighborhood(e.target.value)}
                value={neighborhood}
            />
            <Input
                flexLevel="flex-[1]"
                label="Cidade"
                placeholder="Cidade"
                onChange={handleCityChange}
                value={city}
            />
            <Select
                label="Estado"
                options={states}
                onChange={handleStateChange}
                value={stateRegion}
            />
        </div>
    ), [neighborhood, handleCityChange, city, handleStateChange, stateRegion]);

    const EmailInput = useMemo(() => (
        <div className="flex flex-col gap-1">
            <Input
                label="Email"
                icon="/icons/email.svg"
                placeholder="Insira seu email"
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                value={email}
            />
            {emailTouched && email && !validateInputs.email(email) && (
                <span className="text-[12px] text-red-600">Insira um e-mail válido</span>
            )}
        </div>
    ), [handleEmailChange, handleEmailBlur, emailTouched, email]);

    const PasswordRow = useMemo(() => (
        <div className="flex flex-col lg:flex-row justify-between gap-3">
            <div className="w-full">
                <Pass
                    placeholder="Insira sua senha"
                    label="Insira sua senha"
                    onChange={handlePasswordChange}
                />
            </div>
            <div className="w-full">
                <Pass
                    placeholder="Repita sua senha"
                    label="Repita sua senha"
                    onChange={handleConfirmPasswordChange}
                />
                {confirmPassword && password && password !== confirmPassword && (
                    <span className="text-[12px] text-red-600">Senhas não coincidem</span>
                )}
            </div>
        </div>
    ), [handlePasswordChange, handleConfirmPasswordChange, password, confirmPassword]);

    const TermsCheckbox = useMemo(() => (
        <div className="flex items-start gap-3">
            <input
                type="checkbox"
                id="terms"
                checked={hasAcceptedTerms}
                onChange={handleTermsChange}
                className="mt-1 w-4 h-4 text-[#1B263A] bg-gray-100 border-gray-300 rounded focus:ring-[#1B263A] focus:ring-2"
            />
            <label className="text-[14px] text-[#485B80] font-normal">
                Eu aceito os{' '}
                <span
                    onClick={handleTermsClick}
                    className="text-[#1B263A] font-semibold underline cursor-pointer hover:text-[#D33632] transition-colors"
                >
                    termos de uso
                </span>
                {' '}e as políticas de privacidade da plataforma.
            </label>
        </div>
    ), [hasAcceptedTerms, handleTermsChange, handleTermsClick]);

    const SubmitButton = useMemo(() => (
        <ButtonBlueDefault
            label={isLoading ? 'Criando conta...' : 'Criar uma conta no AutoPilot CRM agora'}
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!hasAcceptedTerms}
        />
    ), [handleSubmit, isLoading, hasAcceptedTerms]);

    const PrivacyText = useMemo(() => (
        <span className="text-[#485B80] text-[14px] font-normal">
            Ao se cadastrar você concorda com nossas <b className="text-[#1B263A] cursor-pointer">Políticas de privacidade.</b>
        </span>
    ), []);

    return (
        <>
            <div className="flex flex-col gap-3">
                {TypeToggle}
                {isLoadingCnpj && personType === 'PJ' && (
                    <div className="flex items-center gap-2 text-[#485B80] text-[14px] font-medium">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Buscando dados do CNPJ...
                    </div>
                )}
                {DocumentRow}
                {ResponsavelRow}
                {CepRow}
                {AddressRow}
                {NeighborhoodRow}
                {EmailInput}
                {PasswordRow}
                {TermsCheckbox}
                {SubmitButton}
                {PrivacyText}
            </div>

            {isTermsModalOpen && (
                <TermsModal
                    onAccept={handleAcceptTerms}
                    onClose={handleCloseTermsModal}
                />
            )}
        </>
    );
}

export default memo(SignUpForm);

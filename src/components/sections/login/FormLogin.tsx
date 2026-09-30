'use client'
import ButtonBlueDefault from "@/components/inputs/buttons/ButtonBlueDefault";
import Pass from "@/components/inputs/password/Pass";
import Input from "@/components/inputs/text/Input";
import validateInputs from "@/utils/classes/sanitizer/validate";
import Link from "next/link";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { ApiApp } from "@/lib/api-app";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo, memo } from "react";

function FormLogin() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const redirectPath = useMemo(() => 
        searchParams.get('redirect') || '/app/dashboard', 
        [searchParams]
    );

    const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }, []);

    const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSenha(event.target.value);
    }, []);

    const handleLogin = useCallback(async () => {
        if (!validateInputs.email(email)) {
            toast.error('Insira um email válido');
            return;
        }

        if (!validateInputs.string(senha, 1)) {
            toast.error('Insira sua senha');
            return;
        }

        setIsLoading(true);
        
        try {
            const api = new ApiApp();
            const [data, error] = await api.auth.login(email, senha);

            if (error) {
                if (error.message.includes('Usuário inativo, pendente ou bloqueado')) {
                    toast.error('Confirme seu email para ativar sua conta. Verifique sua caixa de entrada.');
                } else {
                    toast.error(error.message || 'Erro ao fazer login');
                }
                return;
            }

            if (!data?.token) {
                toast.error('Erro ao obter o token de autenticação');
                return;
            }

            const isBackoffice = data.perfil === 'autopilot';
            const defaultPath = isBackoffice ? '/backoffice/app/assinantes' : '/app/dashboard';

            const userData = {
                id: data.id,
                idLoja: data.idLoja,
                perfil: data.perfil,
                nome: data.nome || 'SEM NOME',
                nomeEmpresa: data.nomeEmpresa || 'SEM NOME',
                token: data.token
            };

            const prefix = isBackoffice ? '-backoffice' : '';
            try {
                localStorage.setItem(`token${prefix}`, data.token);
                localStorage.setItem(`usuario${prefix}`, JSON.stringify(userData));

                const cookieName = isBackoffice ? 'secure_token_backoffice' : 'secure_token';
                const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

                Cookies.set(cookieName, data.token, {
                    expires: 1,
                    secure: isHttps,
                    sameSite: 'lax',
                    path: '/',
                });
            } catch (error) {
                console.error('Erro ao salvar dados de auth:', error);
            }

            const targetPath = redirectPath || defaultPath;
            if (typeof window !== 'undefined') {
                window.location.href = targetPath;
            } else {
                router.replace(targetPath);
            }

        } catch (error) {
            console.error('Erro durante login:', error);
            toast.error('Ocorreu um erro durante o login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [email, senha, router, redirectPath]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        handleLogin();
    }, [handleLogin]);

    const StaticButton = useMemo(() => (
        <ButtonBlueDefault
            label="Faça login na sua conta"
            loading={isLoading}
            type="submit"
            onClick={() => {}}
        />
    ), [isLoading]);

    const StaticLinks = useMemo(() => (
        <>
            <Link
                href="/autenticacao/cadastro"
                className="text-[14px] w-full text-center text-[#1B263A] font-semibold"
            >
                Ainda não possui uma conta <b className="text-[#0F1522]">Cadastre-se Agora</b>
            </Link>
            <Link
                href="/autenticacao/recuperar-conta"
                className="text-[14px] w-full text-center text-[#1B263A] font-semibold"
            >
                Não lembra a sua senha? <b className="text-[#0F1522]">Recupere sua conta</b>
            </Link>
        </>
    ), []);

    const PasswordInput = useMemo(() => (
        <Pass
            placeholder="Insira sua senha"
            label="Insira sua senha"
            onChange={handlePasswordChange}
        />
    ), [handlePasswordChange]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
        >
            <Input
                value={email}
                label="Insira seu email"
                placeholder="email@mail.com"
                onChange={handleEmailChange}
            />
            {PasswordInput}
            {StaticButton}
            {StaticLinks}
        </form>
    );
}

export default memo(FormLogin);
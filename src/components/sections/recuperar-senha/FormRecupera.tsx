'use client'
import ButtonBlueDefault from "@/components/inputs/buttons/ButtonBlueDefault";
import Pass from "@/components/inputs/password/Pass";
import { ApiApp } from "@/lib/api-app";
import validateInputs from "@/utils/classes/sanitizer/validate";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, useMemo, memo } from "react";
import toast from "react-hot-toast";

function FormRecupera(){
    const [novaSenha, setNovaSenha] = useState('');
    const [repetirSenha, setRepetirSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const query = useSearchParams();
    
    const token = useMemo(() => 
        query.get('token') || undefined, 
        [query]
    );

    const handleNovaSenhaChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNovaSenha(event.target.value);
    }, []);

    const handleRepetirSenhaChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRepetirSenha(event.target.value);
    }, []);

    const handleSubmit = useCallback(async () => {
        if(!validateInputs.senhaForte(novaSenha)) {
            toast.error('Essa senha não é forte');
            return;
        }
        if(novaSenha !== repetirSenha) {
            toast.error('As senhas não são iguais');
            return;
        }
        if(!token) {
            toast.error('Token inválido');
            return;
        }

        setIsLoading(true);
        
        try {
            const api = new ApiApp();
            const [res, err] = await api.auth.redefinirSenha(token, novaSenha);

            if(err) {
                toast.error(err.message);
                setIsLoading(false);
                return;
            }
                
            toast.success('Senha redefinida com sucesso! Faça seu login para entrar.');
            router.replace('/autenticacao/login');
        } catch (error) {
            toast.error('Erro ao redefinir senha, tente novamente');
            setIsLoading(false);
        }
    }, [novaSenha, repetirSenha, token, router]);

    const NewPasswordInput = useMemo(() => (
        <Pass 
            placeholder="Insira sua senha" 
            label="Digite uma nova senha" 
            onChange={handleNovaSenhaChange}
        />
    ), [handleNovaSenhaChange]);

    const ConfirmPasswordInput = useMemo(() => (
        <Pass 
            placeholder="Insira sua senha" 
            label="Repita sua senha" 
            onChange={handleRepetirSenhaChange}
        />
    ), [handleRepetirSenhaChange]);

    const StaticButton = useMemo(() => (
        <ButtonBlueDefault  
            onClick={handleSubmit}
            label={isLoading ? 'Processando requisição...' : "Redefinir senha"}
            loading={isLoading}
        />
    ), [handleSubmit, isLoading]);

    const StaticLink = useMemo(() => (
        <Link href="/autenticacao/cadastro" className="text-[14px] w-full text-center text-[#1B263A] font-semibold">
            Ainda não possui uma conta <b className="text-[#0F1522]">Cadastre-se Agora</b>
        </Link>
    ), []);

    return(
        <> 
            {NewPasswordInput}
            {ConfirmPasswordInput}
            {StaticButton}
            {StaticLink}
        </>
    )
}

export default memo(FormRecupera);
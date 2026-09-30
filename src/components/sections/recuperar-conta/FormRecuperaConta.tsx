'use client'
import ButtonBlueDefault from "@/components/inputs/buttons/ButtonBlueDefault";
import Input from "@/components/inputs/text/Input";
import { ApiApp } from "@/lib/api-app";
import validateInputs from "@/utils/classes/sanitizer/validate";
import Link from "next/link";
import { useState, useCallback, useMemo, memo } from "react";
import toast from "react-hot-toast";

function FormRecuperaConta(){
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }, []);

    const handleSubmit = useCallback(async () => {
        if(!validateInputs.email(email)) {
            toast.error('Insira um email válido');
            return;
        }
       
        setIsLoading(true);
        
        try {
            const api = new ApiApp();
            const [response, error] = await api.auth.recuperarSenha(email);
            
            if(error) {
                toast.error('Erro ao recuperar senha, tente novamente mais tarde');
                setIsLoading(false);
                return;
            }

            toast.success('Solicitação enviada com sucesso, verifique sua caixa de entrada');
            setEmail('');
        } catch (error) {
            toast.error('Erro ao recuperar senha, tente novamente mais tarde');
        } finally {
            setIsLoading(false);
        }
    }, [email]);

    const StaticButton = useMemo(() => (
        <ButtonBlueDefault 
            onClick={handleSubmit}
            label={isLoading ? 'Processando requisição...' : "Solicitar link de redefinição"}
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
            <Input 
                placeholder="Insira seu email" 
                label="Email" 
                value={email} 
                onChange={handleEmailChange}
            />      
            {StaticButton}
            {StaticLink}
        </>
    )
}

export default memo(FormRecuperaConta);
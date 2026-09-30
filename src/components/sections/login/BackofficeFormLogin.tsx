'use client'
import ButtonBlueDefault from "@/components/inputs/buttons/ButtonBlueDefault";
import Pass from "@/components/inputs/password/Pass";
import Input from "@/components/inputs/text/Input";
import { ApiApp } from "@/lib/api-app";
import validateInputs from "@/utils/classes/sanitizer/validate";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';

export default function BackofficeFormLogin(){

    const [formLogin,setformLogin] = useState({
        email: '',
        senha: ''
    });
    const [loading,setLoading] = useState<boolean>(false)
    const router = useRouter();
    const searchParams = useSearchParams();


    function updateForm(value:string,tipo:string){
        setformLogin(prev=>({
            ...formLogin,
            [tipo]: value
        }));
    }

    async function post(){
        const api = new ApiApp()
        if(!validateInputs.email(formLogin.email))                               
            return  toast.error('Insira um email valido');
        if(!validateInputs.string(formLogin.senha,1))                          
            return  toast.error('Insira sua senha');

        setLoading(true);
        const [data,error] = await api.auth.login(formLogin.email,formLogin.senha)
        if(error) {
            setLoading(false)
            const errorMessage = error.message
            return toast.error(errorMessage)
        }

        const token = data!.token

        if(!token) {
            const errorMessage = "Erro ao obter o token de autenticação"
            return toast.error(errorMessage)
        }

        const usuario = {
            id: data!.id,
            idLoja:data!.idLoja,
            perfil: data!.perfil,
            nome: data!.nome || 'SEM NOME'
        }

        if( usuario.perfil !== 'autopilot') {
            const errorMessage = "Usuário não autorizado"
            return toast.error(errorMessage)
        }
        else{
            localStorage.setItem('token-backoffice', token)
            localStorage.setItem('usuario-backoffice', JSON.stringify(usuario))

            const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
            Cookies.set('secure_token_backoffice', token, {
                expires: 1,
                secure: isHttps,
                sameSite: 'lax',
                path: '/',
            });

            router.push(searchParams.get('redirect') || '/backoffice/app/dashboard')
        }
    }

    return(
        <form onSubmit={(event)=>{event.preventDefault();post()}} className="flex flex-col gap-4"> 
        <Input value={formLogin.email} label="Insira seu email" placeholder="email@mail.com" onChange={(event)=>{updateForm(event.target.value,'email')}}/>
        <Pass placeholder="Insira sua senha" label="Insira sua senha" onChange={(event)=>{updateForm(event.target.value,'senha')}}/>
        <ButtonBlueDefault label="Faça login na sua conta" onClick={post} loading={loading}/>
    </form>
    )
}
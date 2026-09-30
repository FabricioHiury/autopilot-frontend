'use client';

import Link from "next/link";
import HomeIcon from "./icons/home-icon";
import ServiceIcon from "./icons/service-icon";
import ChatIcon from "./icons/chat-icon";
import CustomerIcon from "./icons/customer-icon";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { KEY_PERMISSOES_LOJA } from "@/utils/types/permissoes_funcionalidades.enum";
import { useAppAuth } from "@/contexts/auth-app-context";
import RelatorioIcon from "./icons/report-icon";

const MOBILE_MENU_ITEMS = [
    { id: 'inicio', href: "/app/dashboard", title: "Início", icon: <HomeIcon />, permissionKey: null },
    { id: 'atendimentos', href: "/app/atendimentos/painel-de-atendimentos", title: "Atendimentos", icon: <ServiceIcon />, permissionKey: KEY_PERMISSOES_LOJA.lojaVerAtendimentos },
    { id: 'chat', href: "/app/atendimentos/chat", title: "Chat", icon: <ChatIcon />, permissionKey: KEY_PERMISSOES_LOJA.lojaVerChat },
    { id: 'clientes', href: "/app/clientes", title: "Clientes", icon: <CustomerIcon />, permissionKey: KEY_PERMISSOES_LOJA.lojaPesquisarClientes },
    { id: 'painel-relatorio', href: "/app/painel-relatorio", title: "Painel", icon: <RelatorioIcon />, permissionKey: KEY_PERMISSOES_LOJA.lojaVerDashboard },
];

export const MobileNav = () => {
    const [permissoes, setPermissoes] = useState<KEY_PERMISSOES_LOJA[]>([]);
    const [hiddenByModal, setHiddenByModal] = useState<boolean>(false);
    const authContext = useAppAuth();

    const temPermissao = (required: KEY_PERMISSOES_LOJA | null): boolean => {
        if (required === null) return true;
        return permissoes.includes(required);
    };

    const visibleMenuItems = useMemo(() => {
        return MOBILE_MENU_ITEMS.filter(item => temPermissao(item.permissionKey));
    }, [permissoes]);

    useEffect(() => {
        const fetchPermissions = async () => {
            const acesso = await authContext.fetchPermissions();
            if (acesso) {
                setPermissoes(acesso.permissions);
            }
        };
        fetchPermissions();
    }, [authContext]);

    useEffect(() => {
        const update = (flag: boolean) => setHiddenByModal(flag);
        const initial = document.body.classList.contains('app-modal-open');
        update(initial);

        const handler = (e: Event) => {
            const ce = e as CustomEvent<boolean>;
            update(!!(ce.detail ?? document.body.classList.contains('app-modal-open')));
        };
        window.addEventListener('modal-open-change' as any, handler as any);
        return () => window.removeEventListener('modal-open-change' as any, handler as any);
    }, []);

    if (visibleMenuItems.length === 0 || hiddenByModal) {
        return null;
    }

    return (
        <nav className="text-white z-10 fixed bottom-0 left-0 w-full bg-[#0F1522] px-4 py-6 rounded-t-2xl">
            <ul className="flex items-center justify-between gap-6">
                {visibleMenuItems.map(item => (
                    <MobileNavItem
                        key={item.id}
                        href={item.href}
                        title={item.title}
                        icon={item.icon}
                    />
                ))}
            </ul>
        </nav>
    )
}

interface MobileNavItemProps {
    title: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
}

const MobileNavItem = ({ icon, title, href, badge }: MobileNavItemProps) => {
    const pathname = usePathname();
    const isActived = pathname === href;
    const badgeValue = badge && badge > 99 ? '99+' : badge;

    return (
        <li className="text-[#7F8999] text-[.63rem] w-[20%] hover:font-semibold hover:text-white aria-selected:font-semibold aria-selected:text-white" aria-selected={isActived}>
            <Link href={href} className="flex flex-col items-center gap-1 relative">
                <div className="w-5 h-5 aria-selected:text-[#D33632] relative" aria-selected={isActived}>
                    {icon}
                    {badge && (
                        <div className="absolute -top-2 -right-2 bg-[#D33632] text-white rounded-full min-w-4 px-0.5 h-4 flex items-center justify-center text-[.5rem]">
                            {badgeValue}
                        </div>
                    )}
                </div>
                {title}
            </Link>
        </li>
    )
}
'use client';

import Link from "next/link";
import HomeIcon from "./icons/home-icon";
import ServiceIcon from "./icons/service-icon";
import ChatIcon from "./icons/chat-icon";
import CustomerIcon from "./icons/customer-icon";
import ConfigIcon from "./icons/config-icon";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import HelpIcon from "./icons/help-icon";
import PlansIcon from "./icons/plans-icon";
import { useAuthBackOffice } from "@/contexts/auth-backoffice-context";
import { KEY_PERMISSOES_AUTOPILOT } from "@/utils/types/permissoes_funcionalidades.enum";

const BACKOFFICE_MOBILE_MENU_ITEMS = [
    { 
        id: 'inicio', 
        href: "/backoffice/app/dashboard", 
        title: "Início", 
        icon: <HomeIcon />, 
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_DASHBOARD 
    },
    { 
        id: 'assinantes', 
        href: "/backoffice/app/assinantes", 
        title: "Assinantes", 
        icon: <CustomerIcon />, 
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_ASSINANTES 
    },
    { 
        id: 'acessos', 
        href: "/backoffice/app/acessos", 
        title: "Acessos", 
        icon: <CustomerIcon />, 
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_USUARIOS_ADMIN 
    },
    { 
        id: 'planos', 
        href: "/backoffice/app/planos", 
        title: "Planos", 
        icon: <PlansIcon />, 
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_ALTERAR_PAINEL_REVENDA 
    },
    { 
        id: 'faq', 
        href: "/backoffice/app/faq", 
        title: "FAQ", 
        icon: <HelpIcon />, 
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_TICKETS 
    },
];


export const BackofficeMobileNav = () => {
    const [permissoes, setPermissoes] = useState<KEY_PERMISSOES_AUTOPILOT[]>([]);
    const authContext = useAuthBackOffice();

    const temPermissao = (required: KEY_PERMISSOES_AUTOPILOT | null): boolean => {
        if (required === null) return true;
        return permissoes.includes(required);
    };

    const visibleMenuItems = useMemo(() => {
        if (!permissoes) return [];
        return BACKOFFICE_MOBILE_MENU_ITEMS.filter(item => temPermissao(item.permissionKey));
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

    if (!permissoes || permissoes.length === 0 || visibleMenuItems.length === 0) {
        return null; // Não renderiza o mobile nav se não há permissões
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

export interface MobileNavItemProps {
    title: string
    icon: React.ReactNode
    href: string
    badge?: number
}

const MobileNavItem = ({ icon, title, href, badge }: MobileNavItemProps) => {

    const badgeValue = badge && badge > 99 ? '99+' : badge
    const pathname = usePathname()
    const isActived = pathname === href

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
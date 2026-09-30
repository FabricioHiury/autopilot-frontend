'use client';

import Image from "next/image";
import HomeIcon from "./icons/home-icon";
import ServiceIcon from "./icons/service-icon";
import ConfigIcon from "./icons/config-icon";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import ExitIcon from "./icons/exit-icon";
import { usePathname, useRouter } from "next/navigation";
import AvatarUser from "../commons/avatar-user";
import { profileImageUrl } from "@/lib/profile.utils";
import HelpIcon from "./icons/help-icon";
import { useAppAuth } from "@/contexts/auth-app-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { KEY_PERMISSOES_LOJA } from "@/utils/types/permissoes_funcionalidades.enum";
import RelatorioIcon from "./icons/report-icon";

const MENU_ITEMS = [
    {
        id: 'inicio',
        icon: <HomeIcon />,
        label: "Início",
        href: "/app/dashboard",
        permissionKey: null,
    },
    {
        id: 'atendimentos',
        icon: <ServiceIcon />,
        label: "Atendimentos",
        href: "/app/atendimentos",
        permissionKey: KEY_PERMISSOES_LOJA.lojaVerAtendimentos,
        subItems: [
            { id: 'painel-atendimentos', label: 'Painel de atendimentos', href: '/app/atendimentos/painel-de-atendimentos', permissionKey: KEY_PERMISSOES_LOJA.lojaVerAtendimentos },
            { id: 'chat', label: 'Chat', href: '/app/atendimentos/chat', permissionKey: KEY_PERMISSOES_LOJA.lojaVerChat },
            { id: 'clientes', label: 'Clientes', href: '/app/clientes', permissionKey: [KEY_PERMISSOES_LOJA.lojaPesquisarClientes, KEY_PERMISSOES_LOJA.lojaCadastrarEditarClientes] },
        ],
    },
    {
        id: 'painel-relatorio',
        icon: <RelatorioIcon />,
        label: "Painel",
        href: "/app/painel-relatorio",
        permissionKey: KEY_PERMISSOES_LOJA.lojaVerDashboard,
    },
    {
        id: 'ajuda-e-faq',
        icon: <HelpIcon />,
        label: "Ajuda e FAQs",
        href: "/app/ajuda-e-faq",
        permissionKey: null,
        subItems: [
            { id: 'duvidas', label: 'Dúvidas frequentes', href: '/app/ajuda-e-faq/duvidas', permissionKey: null },
            { id: 'tickets', label: 'Tickets de ajuda', href: '/app/ajuda-e-faq/tickets', permissionKey: null },
            { id: 'novo-ticket', label: 'Novo Ticket', href: '/app/ajuda-e-faq/novo-ticket', permissionKey: null },
        ]
    },
    {
        id: 'configuracoes',
        icon: <ConfigIcon />,
        label: "Configurações",
        href: "/app/configuracoes",
        permissionKey: [
            KEY_PERMISSOES_LOJA.lojaEditarDadosDaLoja,
            KEY_PERMISSOES_LOJA.lojaConfigurarIntegracoes,
            KEY_PERMISSOES_LOJA.lojaGerenciarUsuarios,
            KEY_PERMISSOES_LOJA.lojaGerenciarSuspensoes,
        ],
        subItems: [
            { id: 'dados-conta', label: 'Dados da Conta', href: '/app/configuracoes/dados-da-loja', permissionKey: KEY_PERMISSOES_LOJA.lojaEditarDadosDaLoja },
            { id: 'integracoes', label: 'Integrações', href: '/app/configuracoes/integracoes', permissionKey: KEY_PERMISSOES_LOJA.lojaConfigurarIntegracoes },
            { id: 'permissoes', label: 'Permissões e acessos', href: '/app/configuracoes/permissoes-e-acessos', permissionKey: KEY_PERMISSOES_LOJA.lojaGerenciarUsuarios },
            { id: 'suspensoes', label: 'Suspensões e Distribuição', href: '/app/configuracoes/suspensoes-distribuicao', permissionKey: [KEY_PERMISSOES_LOJA.lojaGerenciarSuspensoes, KEY_PERMISSOES_LOJA.lojaGerenciarUsuarios] },
            { id: 'assinaturas', label: 'Assinaturas', href: '/app/assinaturas', permissionKey: KEY_PERMISSOES_LOJA.lojaEditarDadosDaLoja },
        ]
    }
];

export const Sidebar = () => {
    const [user, setUser] = useState<any>(null);
    const [permissoes, setPermissoes] = useState<KEY_PERMISSOES_LOJA[]>([]);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const { isCollapsed, toggleCollapsed } = useSidebar();
    const router = useRouter();
    const authContext = useAppAuth();

    const temPermissao = (required: KEY_PERMISSOES_LOJA | KEY_PERMISSOES_LOJA[] | null): boolean => {
        if (required === null) return true;
        if (Array.isArray(required)) {
            return required.some(p => permissoes.includes(p));
        }
        return permissoes.includes(required);
    };

    const visibleMenuItems = useMemo(() => {
        if (!permissoes) return [];
        return MENU_ITEMS.map(item => {
            const subItems = item.subItems?.filter(sub => temPermissao(sub.permissionKey)) || [];
            return { ...item, subItems };
        }).filter(item => temPermissao(item.permissionKey) || (item.subItems && item.subItems.length > 0));
    }, [permissoes]);


    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = localStorage.getItem('usuario');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                const acesso = await authContext.fetchPermissions();
                if (acesso) {
                    setPermissoes(acesso.permissions);
                }
            }
        };
        fetchUserData();
    }, [authContext]);

    const handleLogout = () => {
        authContext.logout();
        router.push('/autenticacao/login');
    }

    if (!permissoes || permissoes.length === 0) {
        return (
            <nav className={`text-white px-4 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-full'}`}>
                <Link href={"/app/dashboard"} className="block mt-10">
                    {isCollapsed ? (
                        <Image src="/images/logo-simple.png" alt="AutoPilot" width={40} height={40} priority={true} className="mx-auto" />
                    ) : (
                        <>
                            <Image src="/images/logo_autopilot.svg" alt="AutoPilot" width={163} height={33} priority={true} />
                            <span className="font-normal text-xs">Seu sistema n1 em gestão veicular.</span>
                        </>
                    )}
                </Link>
            </nav>
        );
    }

    return (
        <nav className={`text-white px-4 transition-all duration-300 flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-full'}`}>
            <div className="mt-10">
                <Link href={"/app/dashboard"} className="block">
                    {isCollapsed ? (
                        <Image src="/images/logo-simple.png" alt="AutoPilot" width={40} height={40} priority={true} className="mx-auto" />
                    ) : (
                        <>
                            <Image src="/images/logo_autopilot.svg" alt="AutoPilot" width={163} height={33} priority={true} />
                            <span className="font-normal text-xs block">Seu sistema n1 em gestão veicular.</span>
                        </>
                    )}
                </Link>
            </div>

            <ul className="mt-16 flex-1 overflow-y-auto">
                {visibleMenuItems.map(item =>
                    item.subItems && item.subItems.length > 0 ? (
                        <SidebarItemExpanded
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            items={item.subItems}
                            expanded={!isCollapsed && expandedMenu === item.id}
                            onChangeExpanded={(isExpanded) => !isCollapsed && setExpandedMenu(isExpanded ? item.id : null)}
                            isCollapsed={isCollapsed}
                            isHovered={hoveredMenu === item.id}
                            onHover={(hovered) => setHoveredMenu(prev => hovered ? item.id : (prev === item.id ? null : prev))}
                        />
                    ) : (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isCollapsed={isCollapsed}
                        />
                    )
                )}
            </ul>

            <div className="mt-auto pt-4 text-[#7F8999] border-t border-[#2A3E65]">
                {!isCollapsed && <span className="text-xs">PERFIL</span>}
                <Link href={temPermissao(KEY_PERMISSOES_LOJA.lojaEditarDadosDaLoja) ? "/app/configuracoes/dados-da-loja" : "#"}>
                    <div className={`mt-4 flex gap-2 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                        <div className="rounded-full font-semibold text-[1.125rem] flex items-center justify-center text-white bg-[#334568] relative flex-shrink-0">
                            <AvatarUser name={user ? user.nome : " "} src={user && profileImageUrl(user.id)} />
                            <span className="block bg-[#24AE6C] w-[.625rem] h-[.625rem] rounded-full absolute bottom-0.5 right-0"></span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                                <span className="text-white font-semibold text-[1.125rem] leading-[1.125rem] truncate">
                                    {user && user.nome}
                                </span>

                                <span className="text-sm capitalize truncate">
                                    {user && user.perfil}
                                </span>

                                <span className="text-sm capitalize whitespace-normal break-words">
                                    Loja: {user && user.nomeEmpresa}
                                </span>
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            <div className="mt-8 mb-4">
                <button
                    className={`group flex gap-3 items-center ${isCollapsed ? 'justify-center' : 'justify-start'} bg-[#222D4280] bg-gradient-to-l from-[#1B284140] to-[#2A3E6540] px-4 py-3 rounded-lg w-full cursor-pointer`}
                    onClick={handleLogout}
                    title={isCollapsed ? 'Sair' : undefined}
                >
                    <div className="transition-colors duration-200 group-hover:text-[#D33632]"><ExitIcon /></div>
                    {!isCollapsed && <span className="text-base text-white font-semibold">Sair</span>}
                </button>
            </div>
        </nav>
    )
}

interface SidebarItemProps {
    icon?: React.ReactNode;
    label: string;
    href: string;
    isCollapsed?: boolean;
}

interface SidebarItemExpandedProps extends SidebarItemProps {
    expanded?: boolean;
    onChangeExpanded?: (expanded: boolean) => void;
    items: {
        label: string;
        href: string;
        badge?: number;
    }[];
    isCollapsed?: boolean;
    isHovered?: boolean;
    onHover?: (hovered: boolean) => void;
}

const SidebarItemExpanded = ({ icon, label, href, expanded = false, onChangeExpanded, items, isCollapsed = false, isHovered = false, onHover }: SidebarItemExpandedProps) => {
    const pathname = usePathname();
    const isActived = pathname.includes(href);
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();
    const itemRef = useRef<HTMLLIElement>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const handleExpanded = () => {
        if (!isCollapsed && onChangeExpanded) {
            onChangeExpanded(!expanded);
        }
    }

    const handleMouseEnter = () => {
        if (isCollapsed && onHover) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = setTimeout(() => {
                if (itemRef.current) {
                    const rect = itemRef.current.getBoundingClientRect();
                    setPopoverPosition({
                        top: rect.top,
                        left: rect.right + 12
                    });
                }
                onHover(true);
            }, 100);
        }
    }

    const handleMouseLeave = () => {
        if (isCollapsed && onHover) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = setTimeout(() => {
                onHover(false);
            }, 200);
        }
    }

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    return (
        <li
            ref={itemRef}
            className="group text-[#7F8999] bg-transparent rounded-lg transition-all duration-300 ease-in-out hover:bg-[#222D4280] bg-gradient-to-l hover:from-[#1B284140] hover:to-[#2A3E6540] aria-expanded:bg-[#222D4280] aria-expanded:from-[#1B284140] aria-expanded:to-[#2A3E6540] relative"
            aria-expanded={expanded}
            aria-selected={isActived}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex gap-3 items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 w-full cursor-pointer`}
                onClick={handleExpanded}
                title={isCollapsed ? label : undefined}
            >
                <div className={`flex gap-3 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                    {icon && <div className="group-hover:text-[#D33632] aria-expanded:text-[#D33632] aria-selected:text-[#D33632]" aria-expanded={expanded} aria-selected={isActived}>{icon}</div>}
                    {!isCollapsed && <span className="text-base group-hover:text-white aria-expanded:text-white aria-expanded:font-semibold aria-selected:text-white" aria-expanded={expanded} aria-selected={isActived}>{label}</span>}
                </div>
                {!isCollapsed && (
                    <div>
                        <Image src="/icons/expand-arrow-menu.svg" alt="Seta de fechar" width={10} height={10} priority={true} className="transition-all duration-100 ease-in-out data-[expanded=true]:rotate-180" data-expanded={expanded} />
                    </div>
                )}
            </button>
            {expanded && !isCollapsed && (
                <ul className="pb-3">
                    {items.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} className="text-[#7F8999] hover:text-white aria-selected:text-white flex gap-3 items-center justify-start px-4 py-3 rounded-lg" aria-selected={pathname.includes(item.href)}>
                                <span>{item.label}</span>
                                {item.badge && (
                                    <div className="bg-[#D33632] text-white rounded-full min-w-4 px-0.5 h-4 flex items-center justify-center text-[.5rem]">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </div>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {isCollapsed && isHovered && (
                <div
                    className="fixed bg-[#1B2841] border border-[#2A3E65] rounded-lg shadow-2xl z-[200] min-w-[220px]"
                    style={{
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="px-4 py-3 border-b border-[#2A3E65] bg-gradient-to-r from-[#1B2841] to-[#222D42]">
                        <div className="flex items-center gap-2">
                            <div className="text-[#D33632]">{icon}</div>
                            <span className="text-white font-semibold">{label}</span>
                        </div>
                    </div>
                    <ul className="py-2">
                        {items.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className="text-[#7F8999] hover:text-white hover:bg-[#222D4280] aria-selected:text-white aria-selected:bg-[#222D4280] flex gap-3 items-center justify-between px-4 py-2.5 transition-colors duration-150"
                                    aria-selected={pathname.includes(item.href)}
                                    onClick={() => onHover && onHover(false)}
                                >
                                    <span className="text-sm">{item.label}</span>
                                    {item.badge && (
                                        <div className="bg-[#D33632] text-white rounded-full min-w-4 px-0.5 h-4 flex items-center justify-center text-[.5rem]">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </li>
    )
}

const SidebarItem = ({ icon, label, href, isCollapsed = false }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActived = pathname.includes(href);

    return (
        <li>
            <Link
                href={href}
                className={`group text-[#7F8999] flex gap-3 bg-transparent hover:bg-[#222D4280] bg-gradient-to-l hover:from-[#1B284140] hover:to-[#2A3E6540] px-4 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}
                aria-selected={isActived}
                title={isCollapsed ? label : undefined}
            >
                {icon && <div className="group-hover:text-[#D33632] aria-selected:text-[#D33632]" aria-selected={isActived}>{icon}</div>}
                {!isCollapsed && <span className="text-base group-hover:text-white aria-selected:text-white" aria-selected={isActived}>{label}</span>}
            </Link>
        </li>
    )
}

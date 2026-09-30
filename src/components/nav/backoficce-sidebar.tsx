'use client';

import Image from "next/image";
import CustomerIcon from "./icons/customer-icon";
import HomeIcon from "./icons/home-icon";
import ServiceIcon from "./icons/service-icon";
import ConfigIcon from "./icons/config-icon";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import ExitIcon from "./icons/exit-icon";
import { usePathname, useRouter } from "next/navigation";
import HelpIcon from "./icons/help-icon";
import AvatarUser from "../commons/avatar-user";
import { profileImageUrl } from "@/lib/profile.utils";
import PlansIcon from "./icons/plans-icon";
import { useAuthBackOffice } from "@/contexts/auth-backoffice-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { KEY_PERMISSOES_AUTOPILOT } from "@/utils/types/permissoes_funcionalidades.enum";

const BACKOFFICE_MENU_ITEMS = [
    {
        id: 'inicio',
        icon: <HomeIcon />,
        label: "Início",
        href: "/backoffice/app/dashboard",
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_DASHBOARD,
    },
    {
        id: 'assinantes',
        icon: <CustomerIcon />,
        label: "Assinantes",
        href: "/backoffice/app/assinantes",
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_ASSINANTES,
    },
    {
        id: 'acessos',
        icon: <CustomerIcon />,
        label: "Acessos",
        href: "/backoffice/app/acessos",
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_USUARIOS_ADMIN,
    },
    {
        id: 'planos',
        icon: <PlansIcon />,
        label: "Planos",
        href: "/backoffice/app/planos",
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_ALTERAR_PAINEL_REVENDA,
    },
    {
        id: 'ajuda-e-faq',
        icon: <HelpIcon />,
        label: "Ajuda & FAQs",
        href: "/backoffice/app/faq",
        permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_TICKETS,
        subItems: [
            { id: 'duvidas-frequentes', label: 'Dúvidas frequentes', href: '/backoffice/app/faq', permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_VER_TICKETS },
            { id: 'tickets-ajuda', label: 'Tickets de ajuda', href: '/backoffice/app/tickets', permissionKey: KEY_PERMISSOES_AUTOPILOT.AUTOPILOT_RESPONDER_TICKETS },
        ],
    },
];

export const BackofficeSidebar = () => {
    const [user, setUser] = useState<any>(null);
    const [permissoes, setPermissoes] = useState<KEY_PERMISSOES_AUTOPILOT[]>([]);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const { isCollapsed, toggleCollapsed } = useSidebar();
    const router = useRouter();
    const authContext = useAuthBackOffice();

    const hasPermissionCheck = (required: KEY_PERMISSOES_AUTOPILOT | KEY_PERMISSOES_AUTOPILOT[] | null): boolean => {
        if (required === null) return true;
        if (Array.isArray(required)) {
            return required.some(p => permissoes.includes(p));
        }
        return permissoes.includes(required);
    };

    const visibleMenuItems = useMemo(() => {
        if (!permissoes) {
            return [];
        }

        const filtered = BACKOFFICE_MENU_ITEMS.map(item => {
            const subItems = item.subItems?.filter(sub => {
                const hasPermission = hasPermissionCheck(sub.permissionKey);
                return hasPermission;
            }) || [];
            return { ...item, subItems };
        }).filter(item => {
            const hasPermission = hasPermissionCheck(item.permissionKey) || (item.subItems && item.subItems.length > 0);
            return hasPermission;
        });

        return filtered;
    }, [permissoes]);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = localStorage.getItem('usuario-backoffice');
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
        router.push('/backoffice/autenticacao/login');
    }

    if (!permissoes || permissoes.length === 0) {
        return null;
    }

    return (
        <nav className={`h-full flex flex-col bg-[#0F1522] text-white transition-all duration-300 ${isCollapsed ? 'w-[4.5rem]' : 'w-[18.75rem]'}`}>
            <div className={`px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <Link href={"/backoffice/app/dashboard"} className={`block mt-10 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {isCollapsed ? (
                        <Image src="/images/logo-simple.png" alt="AutoPilot" width={32} height={32} priority={true} />
                    ) : (
                        <>
                            <Image src="/images/logo_autopilot.svg" alt="AutoPilot" width={163} height={33} priority={true} />
                            <span className="font-normal text-xs">Seu sistema n1 em gestão veicular.</span>
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
                            onHover={(hovered) => setHoveredMenu(hovered ? item.id : null)}
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

            <div className={`mt-16 text-[#7F8999] px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {!isCollapsed && <span className="text-xs">PERFIL</span>}

                <div className={`mt-4 flex gap-2 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                    <div className="rounded-full font-semibold text-[1.125rem] flex items-center justify-center text-white bg-[#334568] relative">
                        <AvatarUser name={user ? user.nome : " "} src={user && profileImageUrl(user.id)} />
                        <span className="block bg-[#24AE6C] w-[.625rem] h-[.625rem] rounded-full absolute bottom-0.5 right-0"></span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white font-semibold text-[1.125rem] leading-[1.125rem]">{user && user.nome}</span>
                            <span className="text-sm capitalize">{user && user.perfil}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`mt-8 mb-4 px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <button
                    className={`group flex gap-3 items-center bg-[#222D4280] bg-gradient-to-l from-[#1B284140] to-[#2A3E6540] px-4 py-3 rounded-lg w-full cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                    onClick={handleLogout}
                    title={isCollapsed ? "Sair" : undefined}
                >
                    <div className="transition-colors duration-200 group-hover:text-[#D33632]">
                        <ExitIcon />
                    </div>
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
        id: string;
        label: string;
        href: string;
        badge?: number;
        permissionKey?: KEY_PERMISSOES_AUTOPILOT;
    }[];
    isHovered?: boolean;
    onHover?: (hovered: boolean) => void;
}

const SidebarItemExpanded = ({
    icon,
    label,
    href,
    expanded = false,
    onChangeExpanded,
    items,
    isCollapsed = false,
    isHovered = false,
    onHover
}: SidebarItemExpandedProps) => {
    const [isExpanded, setIsExpanded] = useState(expanded);
    const pathname = usePathname();
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const isActived = pathname.includes(href);

    const itemIsActived = (itemHref: string) => {
        return pathname.includes(itemHref);
    }

    const handleExpanded = () => {
        if (isCollapsed) return;
        const newState = !isExpanded;
        setIsExpanded(newState);
        if (onChangeExpanded) {
            onChangeExpanded(newState);
        }
    }

    const handleMouseEnter = () => {
        if (onHover) onHover(true);
        if (isCollapsed) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        if (onHover) onHover(false);
        if (isCollapsed) {
            setShowTooltip(false);
        }
    };

    useEffect(() => {
        setIsExpanded(expanded);
    }, [expanded]);

    return (
        <li
            className={`group text-[#7F8999] bg-transparent rounded-lg transition-all duration-300 ease-in-out hover:bg-[#222D4280] bg-gradient-to-l hover:from-[#1B284140] hover:to-[#2A3E6540] aria-expanded:bg-[#222D4280] aria-expanded:from-[#1B284140] aria-expanded:to-[#2A3E6540] ${isCollapsed ? 'mx-2' : 'mx-0'}`}
            aria-expanded={isExpanded}
            aria-selected={isActived}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex gap-3 items-center px-4 py-3 w-full cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                onClick={handleExpanded}
                title={isCollapsed ? label : undefined}
            >
                <div className={`flex gap-3 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                    {icon && <div className="group-hover:text-[#D33632] aria-expanded:text-[#D33632] aria-selected:text-[#D33632]" aria-expanded={isExpanded} aria-selected={isActived}>{icon}</div>}
                    {!isCollapsed && <span className="text-base group-hover:text-white aria-expanded:text-white aria-expanded:font-semibold aria-selected:text-white" aria-expanded={isExpanded} aria-selected={isActived}>{label}</span>}
                </div>
                {!isCollapsed && (
                    <div>
                        <Image src="/icons/expand-arrow-menu.svg" alt="Seta de fechar" width={10} height={10} priority={true}
                            className="transition-all duration-100 ease-in-out data-[expanded=true]:rotate-180"
                            data-expanded={isExpanded}
                        />
                    </div>
                )}
            </button>

            {/* Tooltip para modo colapsado */}
            {isCollapsed && showTooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute left-full ml-2 top-0 bg-[#1a1a1a] text-white px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap"
                >
                    <div className="font-semibold">{label}</div>
                    {items.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {items.map((item, index) => (
                                <Link key={index} href={item.href} className="block text-sm hover:text-[#D33632]">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isCollapsed && isExpanded && (
                <ul className="pb-3">
                    {items.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} className="text-[#7F8999] hover:text-white aria-selected:text-white flex gap-3 items-center justify-start px-4 py-3 rounded-lg" aria-selected={itemIsActived(item.href)}>
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
        </li>
    )
}

const SidebarItem = ({ icon, label, href, isCollapsed = false }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActived = pathname.includes(href);

    return (
        <li className={isCollapsed ? 'mx-2' : 'mx-0'}>
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
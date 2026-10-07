'use client';

import { roleLabel } from '@/lib/presentation-labels';

import Image from 'next/image';
import { AutoPilotLogo } from './AutoPilotLogo';
import CustomerIcon from './icons/customer-icon';
import HomeIcon from './icons/home-icon';
import Link from 'next/link';
import { useEffect, useState, useMemo, useRef } from 'react';
import ExitIcon from './icons/exit-icon';
import { usePathname, useRouter } from 'next/navigation';
import HelpIcon from './icons/help-icon';
import AvatarUser from '../commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { useAuthBackOffice } from '@/contexts/auth-backoffice-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { AdminPermission } from '@/types/permissions';
import { useBackofficePermissions } from '@/hooks/use-backoffice-permissions';

const BACKOFFICE_MENU_ITEMS = [
  {
    id: 'start',
    icon: <HomeIcon />,
    label: 'Início',
    href: '/backoffice/app/dashboard',
    permissionKey: AdminPermission.AUTOPILOT_VIEW_DASHBOARD,
  },
  {
    id: 'assinantes',
    icon: <CustomerIcon />,
    label: 'Concessionárias',
    href: '/backoffice/app/tenants',
    permissionKey: null,
  },
  {
    id: 'acessos',
    icon: <CustomerIcon />,
    label: 'Acessos',
    href: '/backoffice/app/access',
    permissionKey: AdminPermission.AUTOPILOT_VIEW_USERS_ADMIN,
  },
  {
    id: 'ajuda-e-faq',
    icon: <HelpIcon />,
    label: 'Ajuda & FAQs',
    href: '/backoffice/app/faq',
    permissionKey: AdminPermission.AUTOPILOT_VIEW_TICKETS,
    subItems: [
      {
        id: 'duvidas-frequentes',
        label: 'Dúvidas frequentes',
        href: '/backoffice/app/faq',
        permissionKey: AdminPermission.AUTOPILOT_VIEW_TICKETS,
      },
      {
        id: 'tickets-ajuda',
        label: 'Chamados de ajuda',
        href: '/backoffice/app/tickets',
        permissionKey: AdminPermission.AUTOPILOT_REPLY_TICKETS,
      },
    ],
  },
];

export const BackofficeSidebar = () => {
  const { permissions, isLoading, error, retry } = useBackofficePermissions();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const authContext = useAuthBackOffice();

  const user = authContext.getUser();

  const visibleMenuItems = useMemo(() => {
    const hasPermission = (required: AdminPermission | null) =>
      required === null || permissions.includes(required);
    return BACKOFFICE_MENU_ITEMS.map((item) => ({
      ...item,
      subItems: item.subItems?.filter((sub) => hasPermission(sub.permissionKey)) || [],
    })).filter((item) => hasPermission(item.permissionKey) || item.subItems.length > 0);
  }, [permissions]);

  const handleLogout = () => {
    authContext.logout();
    router.push('/backoffice/auth/login');
  };

  return (
    <nav
      aria-label="Menu da administração"
      aria-busy={isLoading}
      className={`h-full flex flex-col bg-[hsl(var(--secondary))] text-white transition-all duration-300 ${isCollapsed ? 'w-[4.5rem]' : 'w-[18.75rem]'}`}
    >
      <div className={`px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link
          href={'/backoffice/app/dashboard'}
          className={`block mt-10 ${isCollapsed ? 'flex justify-center' : ''}`}
        >
          {isCollapsed ? (
            <AutoPilotLogo dark compact />
          ) : (
            <>
              <AutoPilotLogo dark />
              <span className="font-normal text-xs">Seu sistema n1 em gestão veicular.</span>
            </>
          )}
        </Link>
      </div>

      <ul className="mt-16 flex-1 overflow-y-auto">
        {isLoading && (
          <li className="px-4 py-3 text-sm text-secondary-foreground" role="status">
            {isCollapsed ? '…' : 'Carregando acessos…'}
          </li>
        )}
        {error && (
          <li className="px-4 py-3 text-sm text-secondary-foreground">
            {!isCollapsed && <p role="alert">{error}</p>}
            <button
              onClick={retry}
              className="mt-2 underline underline-offset-4"
              aria-label="Tentar carregar acessos novamente"
              title={error}
            >
              {isCollapsed ? '↻' : 'Tentar novamente'}
            </button>
          </li>
        )}
        {visibleMenuItems.map((item) =>
          item.subItems && item.subItems.length > 0 ? (
            <SidebarItemExpanded
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              items={item.subItems}
              expanded={!isCollapsed && expandedMenu === item.id}
              onChangeExpanded={(isExpanded) =>
                !isCollapsed && setExpandedMenu(isExpanded ? item.id : null)
              }
              isCollapsed={isCollapsed}
            />
          ) : (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isCollapsed={isCollapsed}
            />
          ),
        )}
      </ul>

      <div className={`mt-16 text-[#7F8999] px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {!isCollapsed && <span className="text-xs">PERFIL</span>}

        <div
          className={`mt-4 flex gap-2 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <div className="rounded-full font-semibold text-[1.125rem] flex items-center justify-center text-primary-foreground bg-[hsl(var(--primary))] relative">
            <AvatarUser
              name={user ? user.name : ' '}
              src={user ? profileImageUrl(user.id) : undefined}
            />
            <span className="block bg-[#24AE6C] w-[.625rem] h-[.625rem] rounded-full absolute bottom-0.5 right-0"></span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5">
              <span className="text-white font-semibold text-[1.125rem] leading-[1.125rem]">
                {user && user.name}
              </span>
              <span className="text-sm capitalize">{user && roleLabel(user.profile)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-8 mb-4 px-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          className={`group flex gap-3 items-center bg-[#222D4280] bg-gradient-to-l from-secondary/25 to-[#2A3E6540] px-4 py-3 rounded-lg w-full cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={handleLogout}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <div className="transition-colors duration-200 group-hover:text-[hsl(var(--primary))]">
            <ExitIcon />
          </div>
          {!isCollapsed && <span className="text-base text-white font-semibold">Sair</span>}
        </button>
      </div>
    </nav>
  );
};

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
    permissionKey?: AdminPermission;
  }[];
}

const SidebarItemExpanded = ({
  icon,
  label,
  href,
  expanded = false,
  onChangeExpanded,
  items,
  isCollapsed = false,
}: SidebarItemExpandedProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isActived = pathname.includes(href);

  const itemIsActived = (itemHref: string) => {
    return pathname.includes(itemHref);
  };

  const handleExpanded = () => {
    if (isCollapsed) return;
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onChangeExpanded) {
      onChangeExpanded(newState);
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  return (
    <li
      className={`group text-[#7F8999] bg-transparent rounded-lg transition-all duration-300 ease-in-out hover:bg-[#222D4280] bg-gradient-to-l hover:from-secondary/25 hover:to-[#2A3E6540] aria-expanded:bg-[#222D4280] aria-expanded:from-secondary/25 aria-expanded:to-[#2A3E6540] ${isCollapsed ? 'mx-2' : 'mx-0'}`}
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
        <div
          className={`flex gap-3 items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          {icon && (
            <div
              className="group-hover:text-[hsl(var(--primary))] aria-expanded:text-[hsl(var(--primary))] aria-selected:text-[hsl(var(--primary))]"
              aria-expanded={isExpanded}
              aria-selected={isActived}
            >
              {icon}
            </div>
          )}
          {!isCollapsed && (
            <span
              className="text-base group-hover:text-white aria-expanded:text-white aria-expanded:font-semibold aria-selected:text-white"
              aria-expanded={isExpanded}
              aria-selected={isActived}
            >
              {label}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div>
            <Image
              src="/icons/expand-arrow-menu.svg"
              alt="Seta de fechar"
              width={10}
              height={10}
              priority={true}
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
                <Link
                  key={index}
                  href={item.href}
                  className="block text-sm hover:text-[hsl(var(--primary))]"
                >
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
              <Link
                href={item.href}
                className="text-[#7F8999] hover:text-white aria-selected:text-white flex gap-3 items-center justify-start px-4 py-3 rounded-lg"
                aria-selected={itemIsActived(item.href)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <div className="bg-[hsl(var(--primary))] text-primary-foreground rounded-full min-w-4 px-0.5 h-4 flex items-center justify-center text-[.5rem]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const SidebarItem = ({ icon, label, href, isCollapsed = false }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActived = pathname.includes(href);

  return (
    <li className={isCollapsed ? 'mx-2' : 'mx-0'}>
      <Link
        href={href}
        className={`group text-[#7F8999] flex gap-3 bg-transparent hover:bg-[#222D4280] bg-gradient-to-l hover:from-secondary/25 hover:to-[#2A3E6540] px-4 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}
        aria-selected={isActived}
        title={isCollapsed ? label : undefined}
      >
        {icon && (
          <div
            className="group-hover:text-[hsl(var(--primary))] aria-selected:text-[hsl(var(--primary))]"
            aria-selected={isActived}
          >
            {icon}
          </div>
        )}
        {!isCollapsed && (
          <span
            className="text-base group-hover:text-white aria-selected:text-white"
            aria-selected={isActived}
          >
            {label}
          </span>
        )}
      </Link>
    </li>
  );
};

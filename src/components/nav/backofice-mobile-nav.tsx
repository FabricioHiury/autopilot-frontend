'use client';

import Link from 'next/link';
import HomeIcon from './icons/home-icon';
import CustomerIcon from './icons/customer-icon';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import HelpIcon from './icons/help-icon';
import { AdminPermission } from '@/types/permissions';
import { useBackofficePermissions } from '@/hooks/use-backoffice-permissions';

const BACKOFFICE_MOBILE_MENU_ITEMS = [
  {
    id: 'start',
    href: '/backoffice/app/dashboard',
    title: 'Início',
    icon: <HomeIcon />,
    permissionKey: AdminPermission.AUTOPILOT_VIEW_DASHBOARD,
  },
  {
    id: 'assinantes',
    href: '/backoffice/app/tenants',
    title: 'Lojas',
    icon: <CustomerIcon />,
    permissionKey: null,
  },
  {
    id: 'acessos',
    href: '/backoffice/app/access',
    title: 'Acessos',
    icon: <CustomerIcon />,
    permissionKey: AdminPermission.AUTOPILOT_VIEW_USERS_ADMIN,
  },
  {
    id: 'faq',
    href: '/backoffice/app/faq',
    title: 'FAQ',
    icon: <HelpIcon />,
    permissionKey: AdminPermission.AUTOPILOT_VIEW_TICKETS,
  },
];

export const BackofficeMobileNav = () => {
  const { permissions, isLoading, error, retry } = useBackofficePermissions();
  const visibleMenuItems = useMemo(
    () =>
      BACKOFFICE_MOBILE_MENU_ITEMS.filter(
        (item) => item.permissionKey === null || permissions.includes(item.permissionKey),
      ),
    [permissions],
  );

  return (
    <nav
      aria-label="Menu móvel do backoffice"
      aria-busy={isLoading}
      className="text-secondary-foreground z-10 fixed bottom-0 left-0 w-full bg-[hsl(var(--secondary))] px-4 py-6 rounded-t-2xl"
    >
      {isLoading && (
        <p role="status" className="mb-3 text-sm">
          Carregando acessos…
        </p>
      )}
      {error && (
        <div className="mb-3 text-sm">
          <p role="alert">{error}</p>
          <button onClick={retry} className="mt-1 underline underline-offset-4">
            Tentar novamente
          </button>
        </div>
      )}
      <ul className="flex items-center justify-between gap-6">
        {visibleMenuItems.map((item) => (
          <MobileNavItem key={item.id} href={item.href} title={item.title} icon={item.icon} />
        ))}
      </ul>
    </nav>
  );
};

export interface MobileNavItemProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const MobileNavItem = ({ icon, title, href, badge }: MobileNavItemProps) => {
  const badgeValue = badge && badge > 99 ? '99+' : badge;
  const pathname = usePathname();
  const isActived = pathname === href;

  return (
    <li
      className="text-[#7F8999] text-[.63rem] w-[20%] hover:font-semibold hover:text-white aria-selected:font-semibold aria-selected:text-white"
      aria-selected={isActived}
    >
      <Link href={href} className="flex flex-col items-center gap-1 relative">
        <div
          className="w-5 h-5 aria-selected:text-[hsl(var(--primary))] relative"
          aria-selected={isActived}
        >
          {icon}
          {badge && (
            <div className="absolute -top-2 -right-2 bg-[hsl(var(--primary))] text-primary-foreground rounded-full min-w-4 px-0.5 h-4 flex items-center justify-center text-[.5rem]">
              {badgeValue}
            </div>
          )}
        </div>
        {title}
      </Link>
    </li>
  );
};

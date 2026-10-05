'use client';

import Link from 'next/link';
import HomeIcon from './icons/home-icon';
import ServiceIcon from './icons/service-icon';
import ChatIcon from './icons/chat-icon';
import CustomerIcon from './icons/customer-icon';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { StorePermission } from '@/types/permissions';
import { useAppAuth } from '@/contexts/auth-app-context';
import RelatorioIcon from './icons/report-icon';

const MOBILE_MENU_ITEMS = [
  { id: 'start', href: '/app/dashboard', title: 'Início', icon: <HomeIcon />, permissionKey: null },
  {
    id: 'deals',
    href: '/app/deals/pipeline',
    title: 'Atendimentos',
    icon: <ServiceIcon />,
    permissionKey: StorePermission.STORE_VIEW_DEALS,
  },
  {
    id: 'chat',
    href: '/app/deals/chat',
    title: 'Chat',
    icon: <ChatIcon />,
    permissionKey: StorePermission.STORE_VIEW_CHAT,
  },
  {
    id: 'customers',
    href: '/app/customers',
    title: 'Clientes',
    icon: <CustomerIcon />,
    permissionKey: StorePermission.STORE_SEARCH_CUSTOMERS,
  },
  {
    id: 'painel-relatorio',
    href: '/app/reports',
    title: 'Painel',
    icon: <RelatorioIcon />,
    permissionKey: StorePermission.STORE_VIEW_DASHBOARD,
  },
];

export const MobileNav = () => {
  const [permissions, setPermissoes] = useState<StorePermission[]>([]);
  const [hiddenByModal, setHiddenByModal] = useState<boolean>(false);
  const authContext = useAppAuth();

  const temPermissao = (required: StorePermission | null): boolean => {
    if (required === null) return true;
    return permissions.includes(required);
  };

  const visibleMenuItems = useMemo(() => {
    return MOBILE_MENU_ITEMS.filter((item) => temPermissao(item.permissionKey));
  }, [permissions]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const access = await authContext.fetchPermissions();
      if (access) {
        setPermissoes(access.permissions);
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
    <nav className="text-secondary-foreground z-10 fixed bottom-0 left-0 w-full bg-[hsl(var(--secondary))] px-4 py-6 rounded-t-2xl">
      <ul className="flex items-center justify-between gap-6">
        {visibleMenuItems.map((item) => (
          <MobileNavItem key={item.id} href={item.href} title={item.title} icon={item.icon} />
        ))}
      </ul>
    </nav>
  );
};

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
    <li
      className="text-secondary-foreground/65 text-[.63rem] w-[20%] hover:font-semibold hover:text-secondary-foreground aria-selected:font-semibold aria-selected:text-secondary-foreground"
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

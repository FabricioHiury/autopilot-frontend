import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BackofficeSidebar } from '@/components/nav/backoficce-sidebar';
import { BackofficeMobileNav } from '@/components/nav/backofice-mobile-nav';
import { AdminPermission } from '@/types/permissions';
import { getSession, saveSession, clearSession } from '@/services/session';

const mocks = vi.hoisted(() => ({ fetchPermissions: vi.fn(), logout: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/backoffice/app/dashboard',
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@/components/commons/avatar-user', () => ({ default: () => <span>Avatar</span> }));
vi.mock('@/contexts/sidebar-context', () => ({ useSidebar: () => ({ isCollapsed: false }) }));
vi.mock('@/contexts/auth-backoffice-context', () => ({
  useAuthBackOffice: () => ({
    getUser: getSession,
    fetchPermissions: mocks.fetchPermissions,
    logout: mocks.logout,
  }),
}));

const access = (permissions: AdminPermission[] = Object.values(AdminPermission)) => ({
  permissions,
  roles: [],
  fetchedAt: new Date(),
});

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/backoffice/app/dashboard');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  saveSession({
    id: 'admin-local',
    name: 'Administrador Local',
    profile: 'autopilot',
    token: `header.${btoa(JSON.stringify({ exp }))}.signature`,
  });
  mocks.fetchPermissions.mockResolvedValue(access());
});
afterEach(() => {
  cleanup();
  clearSession();
});

describe('backoffice navigation', () => {
  it('loads the menu and profile from the current session without the legacy user key', async () => {
    expect(localStorage.getItem('usuario-backoffice')).toBeNull();
    render(<BackofficeSidebar />);
    expect(await screen.findByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Concessionárias' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acessos' })).toBeInTheDocument();
    expect(screen.getByText('Administrador Local')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('keeps the sidebar and logout visible while permissions are loading', () => {
    mocks.fetchPermissions.mockReturnValue(new Promise(() => {}));
    render(<BackofficeSidebar />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando acessos');
    expect(screen.getByRole('link', { name: 'Concessionárias' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('shows a recoverable permissions error instead of an empty sidebar', async () => {
    mocks.fetchPermissions.mockResolvedValueOnce(null).mockResolvedValueOnce(access());
    render(<BackofficeSidebar />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
    expect(screen.queryByRole('link', { name: 'Acessos' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar acessos novamente' }));
    expect(await screen.findByRole('link', { name: 'Acessos' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps unrestricted navigation available without granting restricted permissions', async () => {
    mocks.fetchPermissions.mockResolvedValue(access([]));
    render(<BackofficeSidebar />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Concessionárias' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Acessos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Início' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('loads the mobile menu with the same permission rules', async () => {
    mocks.fetchPermissions.mockResolvedValue(access([AdminPermission.AUTOPILOT_VIEW_DASHBOARD]));
    render(<BackofficeMobileNav />);
    expect(await screen.findByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lojas' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Acessos' })).not.toBeInTheDocument();
  });

  it('keeps mobile navigation visible and offers retry on request failure', async () => {
    mocks.fetchPermissions
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(access());
    render(<BackofficeMobileNav />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lojas' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('link', { name: 'Acessos' })).toBeInTheDocument();
  });
});

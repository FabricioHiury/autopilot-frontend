'use client';
import { AuthBackOfficeProvider } from '@/contexts/auth-backoffice-context';
import { storeSignal } from '@/redux/store';
import { Provider } from 'react-redux';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={storeSignal}>
      <AuthBackOfficeProvider>{children}</AuthBackOfficeProvider>
    </Provider>
  );
}

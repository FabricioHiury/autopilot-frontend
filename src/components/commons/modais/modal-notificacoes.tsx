'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideModal from '@/components/commons/modais/side-modal';
import ButtonCircle from '../buttons/button-circle/button-circle';
import ButtonAlertIcon from '../buttons/button-circle/icons/button-alert-icon';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import IconX from '@/components/icons/icon-x';
import NoData from '@/components/commons/estados/NoData';
import { AppServices } from '@/services/app.services';
import { cn } from '@/lib/class-name.utils';
import { relativeTime } from '@/lib/relative-time';
import { Notification, NotificationStatus, NotificationType } from '@/types/notification';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';

type TotalNotifications = {
  todas: number;
  VIEWED: number;
  PENDING: number;
};

type CategoryNotification = {
  label: string;
  value: string | NotificationStatus;
};

const useNotificacoes = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('todas');
  const [total, setTotal] = useState<TotalNotifications>({
    todas: 0,
    VIEWED: 0,
    PENDING: 0,
  });

  const api = useMemo(() => new AppServices(), []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);

    const [data, error] = await api.notifications.list(
      category === 'todas' ? undefined : (category as NotificationStatus),
    );

    setLoading(false);

    if (error || !data) {
      console.error(error);
      return;
    }

    setNotifications(data.notifications);
    setTotal({
      todas: data.total,
      VIEWED: data.totalViewed,
      PENDING: data.totalPending,
    });
  }, [api, category]);

  const markAsRead = useCallback(
    async (notification: Notification): Promise<boolean> => {
      const [_, error] = await api.notifications.markRead(
        notification.id,
        NotificationStatus.VIEWED,
      );

      if (error) {
        console.error(error);
        return false;
      }

      await fetchNotifications();
      return true;
    },
    [api, fetchNotifications],
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    const [_, error] = await api.notifications.markAllRead();

    if (error) {
      console.error(error);
      return false;
    }

    await fetchNotifications();
    return true;
  }, [api, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    total,
    category,
    setCategory,
    markAsRead,
    markAllAsRead,
  };
};

const getNotificationAction = (type: string, idReference?: string) => {
  const actionsMap: Record<string, () => void> = {
    [NotificationType.NEW_DEAL]: () => navigateToDeal(idReference || ''),
    [NotificationType.DEAL_TRANSFERRED]: () => navigateToDeal(idReference || ''),
    [NotificationType.DEAL_SHARED]: () => navigateToDeal(idReference || ''),
    [NotificationType.NEW_MESSAGE]: () =>
      (window.location.href = `/app/deals/chat?id=${idReference}`),
    [NotificationType.VISIT_SCHEDULED]: () => navigateToDeal(idReference || ''),
    [NotificationType.VISIT_DAY]: () => navigateToDeal(idReference || ''),
    [NotificationType.VISIT_COMPLETED]: () => navigateToDeal(idReference || ''),
    [NotificationType.TASKS_DAY]: () => navigateToDeal(idReference || ''),
    [NotificationType.TASK_COMPLETED]: () => navigateToDeal(idReference || ''),
    [NotificationType.TASK_CREATED]: () => navigateToDeal(idReference || ''),
    [NotificationType.TICKET_CREATED]: () => (window.location.href = `/backoffice/app/tickets`),
    [NotificationType.TICKET_WITHOUT_REPLY]: () =>
      (window.location.href = `/backoffice/app/tickets`),
  };

  return actionsMap[type] || (() => {});
};

const IconNotification = ({ type }: { type: string }) => {
  switch (type) {
    case NotificationType.NEW_DEAL:
    case NotificationType.DEAL_TRANSFERRED:
    case NotificationType.DEAL_SHARED:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 10.9998C14 11.4245 13.8315 11.8313 13.5314 12.1313C13.2313 12.4314 12.8246 12.5998 12.3999 12.5998H4.3999L1.5999 15.3998V4.5998C1.5999 4.17502 1.76839 3.76831 2.06844 3.46826C2.36849 3.16821 2.7752 2.9998 3.1999 2.9998H12.3999C12.8246 2.9998 13.2313 3.16821 13.5314 3.46826C13.8315 3.76831 14 4.17502 14 4.5998V10.9998Z"
            stroke="#586E9D"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case NotificationType.NEW_MESSAGE:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.66699 2.66699H13.3337C14.067 2.66699 14.667 3.26699 14.667 4.00033V12.0003C14.667 12.7337 14.067 13.3337 13.3337 13.3337H2.66699C1.93366 13.3337 1.33366 12.7337 1.33366 12.0003V4.00033C1.33366 3.26699 1.93366 2.66699 2.66699 2.66699Z"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.667 4L8.00033 8.66667L1.33366 4"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case NotificationType.VISIT_SCHEDULED:
    case NotificationType.VISIT_DAY:
    case NotificationType.VISIT_COMPLETED:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.6673 2.66699H3.33398C2.60055 2.66699 2.00065 3.26689 2.00065 4.00033V13.3337C2.00065 14.0671 2.60055 14.667 3.33398 14.667H12.6673C13.4008 14.667 14.0007 14.0671 14.0007 13.3337V4.00033C14.0007 3.26689 13.4008 2.66699 12.6673 2.66699Z"
            stroke="#2563EB"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.6673 1.33301V3.99967"
            stroke="#2563EB"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.33398 1.33301V3.99967"
            stroke="#2563EB"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.00065 6.66699H14.0007"
            stroke="#2563EB"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case NotificationType.TASKS_DAY:
    case NotificationType.TASK_COMPLETED:
    case NotificationType.TASK_CREATED:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.33398 8.00033L7.33398 10.0003L11.334 6.00033"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00065 14.6663C11.6825 14.6663 14.6673 11.6816 14.6673 7.99967C14.6673 4.31778 11.6825 1.33301 8.00065 1.33301C4.31875 1.33301 1.33398 4.31778 1.33398 7.99967C1.33398 11.6816 4.31875 14.6663 8.00065 14.6663Z"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case NotificationType.TICKET_CREATED:
    case NotificationType.TICKET_WITHOUT_REPLY:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 4.00033V8.00033L10.6667 9.33366"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00065 14.6663C11.6825 14.6663 14.6673 11.6816 14.6673 7.99967C14.6673 4.31778 11.6825 1.33301 8.00065 1.33301C4.31875 1.33301 1.33398 4.31778 1.33398 7.99967C1.33398 11.6816 4.31875 14.6663 8.00065 14.6663Z"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.00065 14.6663C11.6825 14.6663 14.6673 11.6816 14.6673 7.99967C14.6673 4.31778 11.6825 1.33301 8.00065 1.33301C4.31875 1.33301 1.33398 4.31778 1.33398 7.99967C1.33398 11.6816 4.31875 14.6663 8.00065 14.6663Z"
            stroke="#6B7280"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 5.33301V7.99967"
            stroke="#6B7280"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 10.667H8.00667"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

const NotificationCard = ({
  notifications,
  onClick,
}: {
  notifications: Notification;
  onClick: (notifications: Notification) => void;
}) => {
  const isPendente = notifications.status === NotificationStatus.PENDING;

  return (
    <div
      className={cn(
        'min-h-[80px] w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-[1fr,auto] items-center gap-4 border-l-4 relative overflow-hidden cursor-pointer',
        isPendente ? 'border-l-[hsl(var(--primary))]' : 'border-l-transparent',
      )}
      onClick={() => onClick(notifications)}
    >
      {isPendente && (
        <div className="absolute w-2 h-2 right-2 top-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
      )}
      <div className="grow shrink basis-0 flex-col justify-start items-start gap-2 inline-flex">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'text-[#657380] text-xs font-normal leading-3',
              isPendente ? 'font-medium' : '',
            )}
          >
            {relativeTime(new Date(notifications.createdAt))}
          </div>
          <IconNotification type={notifications.type} />
        </div>
        <div className="self-stretch justify-start items-center gap-1 inline-flex">
          <div className="grow shrink basis-0">
            <div
              className={cn(
                'text-[#24292e] text-sm leading-tight',
                isPendente ? 'font-semibold' : 'font-normal',
              )}
            >
              {notifications.message}
            </div>
          </div>
        </div>
      </div>
      <div className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
        <svg
          width="20"
          height="21"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 4.25391L13 10.2539L7 16.2539"
            stroke="#657380"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

const FilterCategories = ({
  categories,
  currentCategory,
  setCategory,
  totals,
}: {
  categories: CategoryNotification[];
  currentCategory: string;
  setCategory: (category: string) => void;
  totals: TotalNotifications;
}) => (
  <div className="flex items-center gap-6 pb-6 px-8">
    {categories.map((cat, index) => {
      const totalAtual = totals[cat.value as keyof typeof totals] || 0;
      const isActive = cat.value === currentCategory;

      return (
        <button
          key={index}
          onClick={() => setCategory(cat.value as string)}
          className={cn(
            'block text-[#95a3b2] text-sm font-semibold leading-tight pb-1 border-b-2 border-transparent transition-all hover:border-[#434d56] flex gap-1',
            isActive ? 'text-[#434d56] border-[hsl(var(--primary))]' : '',
          )}
        >
          <div>{cat.label}</div>
          {totalAtual > 0 && cat.value === NotificationStatus.PENDING && (
            <div className="bg-[hsl(var(--primary))] text-primary-foreground px-1 text-[0.6rem] rounded-full flex items-center justify-center min-w-[1.2rem]">
              {totalAtual}
            </div>
          )}
        </button>
      );
    })}
  </div>
);

const CheckAllIcon = () => (
  <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_4586_155080" fill="white">
      <path d="M0 0.253906H32V32.2539H0V0.253906Z" />
    </mask>
    <path
      d="M0.5 32.2539V0.253906H-0.5V32.2539H0.5Z"
      fill="#B1BCD3"
      mask="url(#path-1-inside-1_4586_155080)"
    />
    <path
      d="M13.333 16.2536L15.9997 18.9202L21.333 13.5869"
      stroke="#586E9D"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6665 16.2536L13.3332 18.9202M15.9998 16.2536L18.6665 13.5869"
      stroke="#586E9D"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ModalNotificacoes() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, loading, total, category, setCategory, markAsRead, markAllAsRead } =
    useNotificacoes();

  const categories = useMemo<CategoryNotification[]>(
    () => [
      { label: 'Todas', value: 'todas' },
      { label: 'Lidas', value: NotificationStatus.VIEWED },
      { label: 'Não lidas', value: NotificationStatus.PENDING },
    ],
    [],
  );

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleNotificationClick = useCallback(
    async (notifications: Notification) => {
      if (notifications.status === NotificationStatus.PENDING) {
        await markAsRead(notifications);
      }

      const action = getNotificationAction(notifications.type, notifications.idReference);

      if (action) {
        action();
        handleClose();
      }
    },
    [markAsRead, handleClose],
  );

  return (
    <>
      <ButtonCircle icon={<ButtonAlertIcon />} onClick={handleOpen} alert={total.PENDING > 0} />
      {open && (
        <SideModal onClose={handleClose} idSelector="content-container" className="h-full p-0">
          <div className="w-full h-screen grid grid-cols-1 grid-rows-[auto,auto,1fr]">
            {/* Header */}
            <div className="flex flex-col p-8 pt-6">
              <div className="w-full flex items-center justify-end mb-2">
                <button onClick={handleClose} className="">
                  <IconX />
                </button>
              </div>
              <div className="w-full flex justify-between gap-2 flex-shrink-0 items-center">
                <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
                  Notificações
                </h2>
                <button
                  onClick={markAllAsRead}
                  disabled={total.PENDING === 0}
                  className={cn(
                    'h-8 rounded-lg border border-[#b1bcd3] justify-center items-center inline-flex',
                    total.PENDING === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
                  )}
                >
                  <div className="p-2 rounded-tl-lg rounded-bl-lg justify-center items-center flex">
                    <div className="text-[#586e9d] text-xs font-semibold leading-none">
                      Marcar todas como lida
                    </div>
                  </div>
                  <div>
                    <CheckAllIcon />
                  </div>
                </button>
              </div>
            </div>

            {/* Filters */}
            <FilterCategories
              categories={categories}
              currentCategory={category}
              setCategory={setCategory}
              totals={total}
            />

            {/* List of notifications */}
            <div className="h-full bg-[#e3ebf3] rounded-tl-2xl rounded-tr-2xl flex flex-col px-6 py-6 gap-4 overflow-y-auto">
              {loading && <LoadingGlobal />}

              {!loading && notifications.length === 0 && <NoData label="Nenhuma notificação" />}

              {notifications.map((notifications) => (
                <NotificationCard
                  key={notifications.id}
                  notifications={notifications}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          </div>
        </SideModal>
      )}
    </>
  );
}

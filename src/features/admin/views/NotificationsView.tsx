import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useSystemNotifications } from '../../../shared/hooks/useSystemQueries';
import type { SystemNotification } from '../../../shared/types';
import { AlertCircleIcon, BellIcon, CheckCircleIcon, ClockIcon } from '../../../shared/components/Icons';

const typeStyles: Record<SystemNotification['type'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
  success: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300',
};

const NotificationTypeIcon: React.FC<{ type: SystemNotification['type'] }> = ({ type }) => {
  if (type === 'warning' || type === 'error') {
    return <AlertCircleIcon className="h-5 w-5" />;
  }
  if (type === 'success') {
    return <CheckCircleIcon className="h-5 w-5" />;
  }
  return <BellIcon className="h-5 w-5" />;
};

const NotificationsView: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useSystemNotifications(currentUser?.id ?? null, page, {
    refetchInterval: 30_000,
    refetchOnMount: 'always',
  });
  const notifications = data?.notifications ?? [];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('notifications')}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('adminNotifications.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {isFetching ? t('adminNotifications.refreshing') : t('adminNotifications.refresh')}
        </button>
      </div>

      <section className="mt-6 space-y-3" aria-live="polite">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {t('adminNotifications.loading')}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{t('adminNotifications.error')}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {t('retry')}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <BellIcon className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('adminNotifications.empty')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${typeStyles[notification.type]}`}
            >
              <span className="mt-0.5 shrink-0">
                <NotificationTypeIcon type={notification.type} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <h2 className="font-bold">{notification.title}</h2>
                  <time className="inline-flex items-center gap-1 text-xs opacity-75" dateTime={notification.timestamp}>
                    <ClockIcon className="h-3.5 w-3.5" />
                    {formatTimestamp(notification.timestamp)}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{notification.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/70 px-2.5 py-1 font-semibold dark:bg-slate-900/40">
                    {t(`adminNotifications.audience.${notification.audience}`)}
                  </span>
                  <span className="rounded-full bg-white/70 px-2.5 py-1 font-semibold dark:bg-slate-900/40">
                    {t(`adminNotifications.delivery.${notification.delivery_status}`)}
                  </span>
                  <span className="opacity-75">
                    {t('adminNotifications.deliveryCounts', {
                      sent: notification.sent_count,
                      failed: notification.failed_count,
                    })}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {!isLoading && !isError && data && data.lastPage > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1 || isFetching}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            {t('adminNotifications.previous')}
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t('adminNotifications.page', { page: data.currentPage, pages: data.lastPage, total: data.total })}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(data.lastPage, currentPage + 1))}
            disabled={page >= data.lastPage || isFetching}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            {t('adminNotifications.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;

import React, { useCallback, useMemo, useState } from 'react';
import { ViewType } from '../../../shared/types';
import { env } from '../../../core/config/env';
import { useAdminEducators } from '../../../core/hooks/useAdminQueries';
import { useAdminEducatorApplications } from '../hooks/useAdminQueries';
import RejectedEducatorsView, { RejectedEducatorRecord } from './RejectedEducatorsView';

interface Props {
  navigateTo: (view: ViewType, context?: any) => void;
}

const toArray = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.educators)) return payload.educators;
  if (Array.isArray(payload?.applications)) return payload.applications;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.educators)) return payload.data.educators;
  if (Array.isArray(payload?.data?.applications)) return payload.data.applications;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const normalizeStatus = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value).trim().toUpperCase();
  }
  return '';
};

const pickReason = (...values: Array<unknown>): string | null => {
  for (const candidate of values) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return null;
};

const RejectedEducatorsContainer: React.FC<Props> = ({ navigateTo }) => {
  const [query, setQuery] = useState('');

  const educatorsQuery = useAdminEducators({ paginated: 'true' as const, per_page: env.DEFAULT_PAGE_SIZE, status: 'rejected' as any });
  const applicationsQuery = useAdminEducatorApplications({ per_page: env.DEFAULT_PAGE_SIZE, status: 'rejected' as any });

  const educators = useMemo(() => toArray(educatorsQuery.data), [educatorsQuery.data]);
  const applications = useMemo(() => toArray(applicationsQuery.data), [applicationsQuery.data]);

  const applicationMap = useMemo(() => {
    const map = new Map<string, any>();
    applications.forEach((app: any) => {
      const educatorId = String(app?.educatorId ?? app?.educator_id ?? app?.educator?.id ?? '');
      if (educatorId) {
        map.set(educatorId, app);
      }
    });
    return map;
  }, [applications]);

  const records = useMemo<RejectedEducatorRecord[]>(() => {
    return educators.reduce<RejectedEducatorRecord[]>((acc, raw) => {
      const status = normalizeStatus(raw?.status ?? raw?.educatorStatus ?? raw?.profile?.status);
      if (status && status !== 'REJECTED') {
        return acc;
      }

      const educatorIdValue = raw?.id ?? raw?.educatorId ?? raw?.educator_id;
      if (!educatorIdValue) {
        return acc;
      }

      const educatorId = String(educatorIdValue);
      const application = applicationMap.get(educatorId) ?? applicationMap.get(String(raw?.applicationId ?? raw?.application_id ?? ''));
      const applicationId = application?.id ?? raw?.applicationId ?? raw?.application_id ?? educatorId;

      const rejectionReason = pickReason(
        application?.rejectionReason,
        application?.reason,
        raw?.rejectionReason,
        raw?.rejection_reason,
        raw?.profile?.rejectionReason,
        raw?.profile?.rejection_reason,
        raw?.basicInfo?.rejectionReason,
        raw?.basicInfo?.rejection_reason,
        raw?.accountRejectionReason,
        raw?.account_rejection_reason
      );

      const applicationDate = application?.applicationDate
        ?? application?.submittedAt
        ?? application?.submitted_at
        ?? raw?.rejectedAt
        ?? raw?.rejected_at
        ?? raw?.updatedAt
        ?? raw?.updated_at
        ?? null;

      acc.push({
        id: educatorId,
        applicationId: String(applicationId),
        name: raw?.name ?? '',
        email: raw?.email ?? '',
        discipline: raw?.discipline ?? raw?.specialization ?? '',
        country: raw?.country ?? raw?.profile?.country ?? raw?.basicInfo?.country ?? '',
        avatarUrl: raw?.avatarUrl ?? raw?.avatar_url ?? '',
        rejectionReason: rejectionReason ?? '',
        applicationDate: applicationDate ? String(applicationDate) : ''
      });

      return acc;
    }, []);
  }, [educators, applicationMap]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) =>
      [record.name, record.email, record.discipline, record.country, record.rejectionReason, record.applicationDate]
        .filter((field): field is string => typeof field === 'string' && field.length > 0)
        .some((field) => field.toLowerCase().includes(normalizedQuery))
    );
  }, [records, query]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleView = useCallback(
    (record: RejectedEducatorRecord) => {
      navigateTo('educatorApplicationDetail', {
        id: record.applicationId || record.id,
        backTo: 'rejectedEducators',
        mode: 'application'
      });
    },
    [navigateTo]
  );

  const handleRetry = useCallback(() => {
    educatorsQuery.refetch();
    applicationsQuery.refetch();
  }, [educatorsQuery, applicationsQuery]);

  return (
    <RejectedEducatorsView
      records={filteredRecords}
      totalCount={records.length}
      query={query}
      onQueryChange={handleQueryChange}
      onView={handleView}
      isLoading={educatorsQuery.isLoading || applicationsQuery.isLoading}
      isFetching={educatorsQuery.isFetching || applicationsQuery.isFetching}
      isError={Boolean(educatorsQuery.isError || applicationsQuery.isError)}
      onRetry={handleRetry}
    />
  );
};

export default RejectedEducatorsContainer;

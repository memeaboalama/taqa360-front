import React, { useEffect, useMemo, useState } from 'react';
import EducationalRequestsView from './EducationalRequestsView';
import { ViewType, EducationalRequest, EducationalRequestStatus, PaymentStatus, FulfillmentStatus, PricingType, User, Project } from '../../../shared/types';
import { useAdminEducationalRequests } from '../../../core/hooks/useAdminQueries';
import { QueryParams } from '../../../core/api/types';

interface Props {
  navigateTo: (view: ViewType, id?: any) => void;
}

const normalizeStatus = (val: any): EducationalRequestStatus => {
  const s = (val || 'PENDING').toString().toLowerCase();
  if (s === 'approved' || s === 'accepted') return 'ACCEPTED';
  if (s === 'rejected') return 'REJECTED';
  return 'PENDING';
};
const normalizePayment = (val: any): PaymentStatus => {
  const s = (val || 'UNPAID').toString().toLowerCase();
  if (s === 'paid') return 'PAID';
  if (s === 'partially_paid' || s === 'partially-paid' || s === 'partial') return 'PARTIALLY_PAID';
  return 'UNPAID';
};
const normalizeFulfillment = (val: any): FulfillmentStatus => {
  const s = (val || 'PENDING').toString().toLowerCase();
  if (s === 'in-progress' || s === 'in_progress' || s === 'inprogress') return 'IN_PROGRESS';
  if (s === 'completed' || s === 'done') return 'COMPLETED';
  return 'PENDING';
};

const EducationalRequestsContainer: React.FC<Props> = ({ navigateTo }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const apiParams = useMemo<QueryParams & { status?: string; paymentStatus?: string }>(() => {
    const params: QueryParams & { status?: string; paymentStatus?: string } = {
      per_page: perPage,
      page: currentPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status !== 'all') params.status = status === 'ACCEPTED' ? 'approved' : status.toLowerCase();
    if (paymentStatus !== 'all') params.paymentStatus = paymentStatus.toLowerCase();
    return params;
  }, [currentPage, debouncedSearch, paymentStatus, perPage, status]);

  const reqQuery = useAdminEducationalRequests(apiParams);

  const { requests, users } = useMemo(() => {
    const payloadData: any = (reqQuery.data as any);
    const rawList: any[] = Array.isArray(payloadData)
      ? payloadData
      : payloadData?.data?.educationalRequests || payloadData?.data?.educational_requests || payloadData?.data || payloadData?.educationalRequests || payloadData?.educational_requests || [];
    const list: any[] = rawList || [];
    const requests: EducationalRequest[] = list.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      subject: r.subject || r.academicMajor || '',
      educationLevel: r.educationLevel || '',
      requesterId: r.requesterId || r.requester?.id || r.requesterName || 'unknown',
      status: normalizeStatus(r.status),
      paymentStatus: normalizePayment(r.paymentStatus),
      fulfillmentStatus: normalizeFulfillment(r.executionStatus),
      budget: r.budget ?? null,
      pricingType: PricingType.FIXED,
      expectedDeliveryDate: r.dedline || r.deadline || null,
      attachments: Array.isArray(r.attachments) ? r.attachments : [],
      finalAgreement: r.finalAgreement || '',
      activityLog: [],
      createdAt: r.createdAt || '',
      project: r.project ? { id: r.project.id, title: r.project.title } : null,
    }));

    const users: User[] = list.map((r: any, i: number) => ({
      id: r.requesterId || r.requester?.id || r.requesterName || `u-${i}`,
      name: r.requesterName || r.requester?.name || 'Unknown',
      email: r.requester?.email || r.email || '',
      phone: r.requester?.phone || r.phone || '',
      city: r.requester?.city || r.city || r.requester?.country || '',
      address: r.requester?.address || r.address || '',
      avatarUrl: r.requester?.avatarUrl || r.avatarUrl || '',
      registrationDate: '',
      status: 'ACTIVE' as any,
    }));
    return { requests, users };
  }, [reqQuery.data]);

  return (
    <EducationalRequestsView
      requests={requests}
      projects={[] as Project[]}
      users={users}
      navigateTo={navigateTo}
      searchTerm={search}
      statusFilter={status}
      paymentFilter={paymentStatus}
      perPage={perPage}
      onPerPageChange={(value) => {
        setPerPage(value);
        setCurrentPage(1);
      }}
      onSearchChange={(value) => {
        setSearch(value);
        setCurrentPage(1);
      }}
      onStatusFilterChange={(value) => {
        setStatus(value);
        setCurrentPage(1);
      }}
      onPaymentFilterChange={(value) => {
        setPaymentStatus(value);
        setCurrentPage(1);
      }}
      isLoading={reqQuery.isLoading}
      isFetching={reqQuery.isFetching}
      isError={reqQuery.isError}
      onRetry={() => reqQuery.refetch()}
      pagination={reqQuery.pagination}
      onPageChange={setCurrentPage}
    />
  );
};

export default EducationalRequestsContainer;

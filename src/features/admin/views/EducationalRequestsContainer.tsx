import React, { useMemo, useState } from 'react';
import EducationalRequestsView from './EducationalRequestsView';
import { ViewType, EducationalRequest, EducationalRequestStatus, PaymentStatus, FulfillmentStatus, PricingType, User, Project } from '../../../shared/types';
import { useAdminEducationalRequests } from '../../../core/hooks/useAdminQueries';

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

  const apiParams: any = { paginated: "true" as const, per_page: 10, sort_by: 'created_at' };
  if (search) apiParams.search = search;
  if (status !== 'all') apiParams.status = status;
  if (paymentStatus !== 'all') apiParams.paymentStatus = paymentStatus;

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

    requests.sort((a, b) => {
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      if (idA && idB) return idB - idA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
      onSearchChange={setSearch}
      onStatusFilterChange={setStatus}
      onPaymentFilterChange={setPaymentStatus}
      isLoading={reqQuery.isLoading}
    />
  );
};

export default EducationalRequestsContainer;

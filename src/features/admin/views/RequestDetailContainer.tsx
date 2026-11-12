import React from 'react';
import RequestDetailView from './RequestDetailView';
import { ViewType, EducationalRequest, EducationalRequestStatus, PaymentStatus, FulfillmentStatus, PricingType, User, Project, RequestActivityType } from '../../../shared/types';
import { useAdminEducationalRequest, useAdminProject, useUpdateEducationalRequest, useChangeEducationalRequestStatus } from '../../../core/hooks/useAdminQueries';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Props {
  requestId: string;
  navigateTo: (view: ViewType, id?: any) => void;
}

const RequestDetailContainer: React.FC<Props> = ({ requestId, navigateTo }) => {
  const { addToast } = useData();
  const { t } = useLanguage();
  const reqQuery = useAdminEducationalRequest(requestId);
  const rawRequest: any = (reqQuery.data as any)?.educationalRequest || reqQuery.data || {};
  const linkedProjectId = rawRequest?.project?.id || rawRequest?.project?.uuid || '';
  const linkedProjectQuery = useAdminProject(linkedProjectId);
  const updateMutation = useUpdateEducationalRequest();
  const changeStatusMutation = useChangeEducationalRequestStatus();

  const isSaving = updateMutation.isPending || changeStatusMutation.isPending;

  if (reqQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
        <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
      </div>
    );
  }
  if (reqQuery.isError || !reqQuery.data) {
    return <div className="p-6 text-center text-red-500">حدث خطأ أثناء جلب تفاصيل الطلب.</div>;
  }

  const raw: any = rawRequest;
  const projectPayload: any = (linkedProjectQuery.data as any)?.project || linkedProjectQuery.data;
  const linkedProject: Project | null = projectPayload ? {
    ...projectPayload,
    projectNumber: projectPayload.projectNumber ?? projectPayload.project_number ?? null,
    startDate: projectPayload.startDate ?? projectPayload.start_date ?? null,
    createdBy: projectPayload.createdBy ?? projectPayload.created_by ?? null,
    tasks: Array.isArray(projectPayload.tasks) ? projectPayload.tasks : [],
  } as Project : raw.project || null;

  const normalizedAttachments = Array.isArray(raw.attachments)
    ? raw.attachments.map((a: any) => ({
        id: a.id,
        name: a.name || a.original_name || 'ملف',
        url: a.url,
        size: typeof a.size === 'number' ? `${a.size} MB` : String(a.size || ''),
        type: a.type || a.collection_name || 'EDUCATION_REQUEST_ATTACHMENTS',
      }))
    : [];

  const normalizeRequestStatus = (st?: string): EducationalRequestStatus => {
    const s = (st || '').toString().toUpperCase();
    if (s === 'APPROVED' || s === 'ACCEPTED') return EducationalRequestStatus.ACCEPTED;
    if (s === 'REJECTED') return EducationalRequestStatus.REJECTED;
    return EducationalRequestStatus.PENDING;
  };

  const normalizePaymentStatus = (st?: string): PaymentStatus => {
    const s = (st || '').toString().toUpperCase();
    if (s === 'PAID') return PaymentStatus.PAID;
    if (s === 'PARTIAL' || s === 'PARTIALLY_PAID') return PaymentStatus.PARTIALLY_PAID;
    return PaymentStatus.UNPAID;
  };

  const normalizeFulfillmentStatus = (st?: string): FulfillmentStatus => {
    const s = (st || '').toString().replace('-', '_').toUpperCase();
    if (s === 'IN_PROGRESS' || s === 'IN-PROGRESS') return FulfillmentStatus.IN_PROGRESS;
    if (s === 'COMPLETED') return FulfillmentStatus.COMPLETED;
    return FulfillmentStatus.PENDING;
  };
  const formatActivityStatus = (status?: string) => {
    if (!status) return '';
    const key = `status.${status.replace(/[-\s]/g, '_').toUpperCase()}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const request: EducationalRequest = {
    id: raw.id,
    code: raw.code,
    serviceType: raw.serviceType || raw.type || null,
    serviceId: raw.serviceId || raw.service_id || null,
    serviceName: raw.serviceName || raw.service_name || null,
    projectSiteType: raw.projectSiteType || raw.project_site_type || null,
    solarSystemType: raw.solarSystemType || raw.solar_system_type || null,
    title: raw.title,
    description: raw.description || '',
    subject: raw.subject || raw.academicMajor || '',
    educationLevel: raw.educationLevel || '',
    academicMajor: raw.academicMajor ?? null,
    requesterId: (raw.requester && (raw.requester.id || raw.requester.name)) || raw.requesterName || 'unknown',
    status: normalizeRequestStatus(raw.status),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    fulfillmentStatus: normalizeFulfillmentStatus(raw.executionStatus || raw.fulfillmentStatus),
    reviewedAt: raw.reviewedAt ?? null,
    budget: raw.budget ?? null,
    urgencyLevel: raw.urgencyLevel ?? raw.urgency_level ?? null,
    pricingType: (raw.pricingType || raw.pricing_type || 'FIXED').toString().toUpperCase() === 'HOURLY' ? PricingType.HOURLY : PricingType.FIXED,
    expectedDeliveryDate: raw.expectedDeliveryDate || raw.dedline || raw.deadline || null,
    attachments: normalizedAttachments,
    finalAgreement: raw.finalAgreement || '',
    additionalNotes: raw.additionalNotes ?? null,
    activityLog: Array.isArray(raw.activityLog) ? raw.activityLog.map((activity: any) => ({
      id: String(activity.id),
      type: (activity.type === 'details'
        ? 'DETAILS_UPDATED'
        : activity.type === 'payment' || activity.activityType === 'payment'
          ? 'PAYMENT_STATUS_CHANGED'
          : activity.type === 'fulfillment' || activity.activityType === 'fulfillment'
            ? 'FULFILLMENT_STATUS_CHANGED'
            : 'STATUS_CHANGED') as RequestActivityType,
      detailsKey: activity.type === 'details'
        ? 'request.details_updated'
        : (activity.type || activity.activityType) === 'payment'
          ? 'request.payment_status_changed'
          : (activity.type || activity.activityType) === 'fulfillment'
            ? 'request.fulfillment_status_changed'
            : 'request.status_changed',
      detailsPayload: {
        from: formatActivityStatus(activity.fromStatus),
        to: formatActivityStatus(activity.toStatus),
      },
      changes: activity.changes ?? activity.details ?? undefined,
      actor: activity.actor || 'الإدارة',
      actorAvatar: '',
      timestamp: activity.timestamp || '',
      reason: activity.reason || undefined,
    })) : [],
    createdAt: raw.createdAt || '',
  };

  const users: User[] = [
    {
      id: raw.requester?.id || request.requesterId,
      name: raw.requester?.name || raw.requesterName || 'Unknown',
      email: raw.requester?.email || raw.email || '',
      phone: raw.requester?.phone || raw.phone || '',
      city: raw.requester?.city || raw.city || raw.requester?.country_name || '',
      address: raw.requester?.address || raw.address || '',
      avatarUrl: raw.requester?.avatarUrl || '',
      registrationDate: '',
      status: 'ACTIVE' as any,
    }
  ];

  const handleUpdateRequestStatus = async (requestId: string, newStatus: EducationalRequestStatus, reason?: string) => {
    try {
      await changeStatusMutation.mutateAsync({ id: requestId, type: 'request', status: newStatus, reason });
      addToast('تم تغيير حالة الطلب بنجاح', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تغيير حالة الطلب', 'error');
      throw err;
    }
  };

  const handleUpdatePaymentStatus = async (requestId: string, newStatus: PaymentStatus, reason?: string) => {
    try {
      await changeStatusMutation.mutateAsync({ id: requestId, type: 'payment', status: newStatus, reason });
      addToast('تم تغيير حالة الدفع بنجاح', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تغيير حالة الدفع', 'error');
      throw err;
    }
  };

  const handleUpdateFulfillmentStatus = async (requestId: string, newStatus: FulfillmentStatus, reason?: string) => {
    try {
      await changeStatusMutation.mutateAsync({ id: requestId, type: 'fulfillment', status: newStatus, reason });
      addToast('تم تغيير حالة الإنجاز بنجاح', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تغيير حالة الإنجاز', 'error');
      throw err;
    }
  };

  const handleUpdateRequest = async (requestId: string, details: Partial<EducationalRequest>) => {
    try {
      await updateMutation.mutateAsync({ id: requestId, data: details });
      addToast('تم تحديث تفاصيل الطلب بنجاح', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تحديث البيانات', 'error');
      throw err;
    }
  };

  const handleAddNote = (_requestId: string, _content: string) => {
    // TODO: connect to notes API when endpoint is available
  };

  return (
    <RequestDetailView
      request={request}
      users={users}
      linkedProject={linkedProject}
      isLinkedProjectLoading={linkedProjectQuery.isLoading}
      navigateTo={navigateTo}
      isSaving={isSaving}
      onUpdateRequestStatus={handleUpdateRequestStatus}
      onUpdatePaymentStatus={handleUpdatePaymentStatus}
      onUpdateFulfillmentStatus={handleUpdateFulfillmentStatus}
      onUpdateRequest={handleUpdateRequest}
      onAddNote={handleAddNote}
    />
  );
};

export default RequestDetailContainer;

import React from 'react';
import CreateProjectView from './CreateProjectView';
import { useCreateProject, useAdminEducationalRequests, useAdminEducationalRequest } from '../../../core/hooks/useAdminQueries';
import { ViewType, ProjectCreationType, EducationalRequest, EducationalRequestStatus, PaymentStatus, FulfillmentStatus, PricingType } from '../../../shared/types';
import { useQueryClient } from '@tanstack/react-query';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { adminService } from '../../../core/services/AdminService';

interface Props {
  navigateTo: (view: ViewType, id?: string) => void;
  selectedRequestId: string | null;
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

const CreateProjectContainer: React.FC<Props> = ({ navigateTo, selectedRequestId }) => {
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const { addToast } = useData();
  const { t } = useLanguage();
  const [search, setSearch] = React.useState('');

  const requestsQuery = useAdminEducationalRequests({ paginated: "true" as const, per_page: 50, search });

  const payloadData: any = (requestsQuery.data as any);
  const rawRequests: any[] = Array.isArray(payloadData)
    ? payloadData
    : payloadData?.data?.educationalRequests || payloadData?.data?.educational_requests || payloadData?.data || payloadData?.educationalRequests || payloadData?.educational_requests || [];

  const educationalRequests: EducationalRequest[] = (rawRequests || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    subject: r.subject || '',
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
  }));

  // If we were navigated here with a specific request id, fetch that request directly and ensure it is present in options
  const singleRequestQuery = useAdminEducationalRequest(selectedRequestId || '');
  const singleRequestRaw: any = singleRequestQuery && !singleRequestQuery.isLoading && !singleRequestQuery.isError ? ((singleRequestQuery.data as any)?.educationalRequest || singleRequestQuery.data) : null;
  if (singleRequestRaw) {
    const normalizedSingle: EducationalRequest = {
      id: singleRequestRaw.id,
      title: singleRequestRaw.title,
      description: singleRequestRaw.description || '',
      subject: singleRequestRaw.subject || '',
      educationLevel: singleRequestRaw.educationLevel || '',
      requesterId: singleRequestRaw.requesterId || singleRequestRaw.requester?.id || singleRequestRaw.requesterName || 'unknown',
      status: normalizeStatus(singleRequestRaw.status),
      paymentStatus: normalizePayment(singleRequestRaw.paymentStatus),
      fulfillmentStatus: normalizeFulfillment(singleRequestRaw.executionStatus),
      budget: singleRequestRaw.budget ?? null,
      pricingType: PricingType.FIXED,
      expectedDeliveryDate: singleRequestRaw.dedline || singleRequestRaw.deadline || null,
      attachments: Array.isArray(singleRequestRaw.attachments) ? singleRequestRaw.attachments : [],
      finalAgreement: singleRequestRaw.finalAgreement || '',
      activityLog: [],
      createdAt: singleRequestRaw.createdAt || '',
    };

    // ensure no duplicate and place it at the front
    const exists = educationalRequests.find(r => r.id === normalizedSingle.id);
    if (!exists) {
      educationalRequests.unshift(normalizedSingle);
    }
  }

  return (
    <CreateProjectView
      navigateTo={navigateTo}
      educationalRequests={educationalRequests}
      selectedRequestId={selectedRequestId}
      onSearchChange={setSearch}
      searchTerm={search}
      isRequestsFetching={Boolean((requestsQuery as any)?.isFetching)}
      isPending={createProject.isPending}
      onAddProject={async (projectData) => {
        const form = new FormData();
        form.append('title', projectData.title);
        form.append('description', projectData.description);
        form.append('creation_type', (projectData.creationType || ProjectCreationType.STANDALONE).toLowerCase());
        if (projectData.creationType === ProjectCreationType.FROM_REQUEST && projectData.educationalRequestId) {
          form.append('educational_request_id', String(projectData.educationalRequestId));
        }
        (projectData.tags || []).forEach(tag => form.append('tags[]', tag));


        const res = await createProject.mutateAsync(form as any);
        const rawData: any = (res as any)?.data ?? res;
        const created: any = Array.isArray(rawData) ? rawData[0] : (rawData?.project || rawData);
        const newId = created?.id;

        // Upload attachments sequentially if the project was created successfully
        if (newId) {
          const validAtts = (projectData.attachments || []).filter((a: any) => a && a.title && a.file);
          for (const a of validAtts) {
            try {
              await adminService.createProjectAttachment(newId, {
                title: a.title,
                attachment: a.file as File
              });
            } catch (err) {
              console.error("Failed to upload attachment during project creation", err);
            }
          }
        }

        // Reset queries so the projects list doesn't show old cached data while fetching
        queryClient.resetQueries({ queryKey: ['projects', 'list'] });
        
        addToast(t('toasts.projectCreated'));

        if (newId) {
          navigateTo('projectDetail', newId);
        } else {
          navigateTo('projects');
        }
      }}
    />
  );
};

export default CreateProjectContainer;

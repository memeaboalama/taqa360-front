import React, { useMemo } from 'react';
import AdminBidDetailView from './BidDetailView';
import { useAdminBid, useApproveBidTask, useRejectBidTask, useDecideBidModification } from '../../../core/hooks/useAdminQueries';
import { QueryKeyFactory } from '../../../core/hooks/useBaseQuery';
import { useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../core/services/AdminService';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import ErrorBoundary from '../../../shared/components/ErrorBoundary';
import { Bid, Educator, Project, Task, BidStatus, Attachment, PricedBidTask, ViewType, PaymentInfo } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';

interface BidDetailContainerProps {
  bidId: string;
  navigateTo: (view: ViewType, id?: string | null) => void;
}

const mapAttachment = (a: any): Attachment => ({
  id: String(a.id ?? a.attachment_id ?? a.file_id ?? `${Math.random()}`),
  name: a.name || a.original_name || a.title || 'Attachment',
  url: a.url,
  size: typeof a.size === 'number' ? a.size : Number(a.size || 0),
  type: String(a.type || ''),
});

const ensureArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value.filter(Boolean) : []);

const createDefaultPaymentInfo = (): PaymentInfo => ({
  bankName: '',
  accountHolderName: '',
  iban: '',
});

const DEFAULT_EDUCATOR_PROFILE = {
  identityStatus: null,
  verificationStatus: null,
  gender: null,
  birthDate: null,
  nationality: null,
  country: null,
  city: null,
  educationLevel: null,
  experienceYears: 0,
  employmentStatus: null,
  profileCompletion: 0,
  experienceLevel: null,
  idType: null,
  idNumber: '',
  idDocumentUrl: null,
  idDocumentBackUrl: null,
  rejectionReason: null,
  isComplete: false,
};

const BidDetailContainer: React.FC<BidDetailContainerProps> = ({ bidId, navigateTo }) => {
  const { t } = useLanguage();
  const { addToast } = useData();
  const queryClient = useQueryClient();
  const bidQuery = useAdminBid(bidId);
  const approveTask = useApproveBidTask();
  const rejectTask = useRejectBidTask();
  const decideModification = useDecideBidModification();

  const mapped = useMemo(() => {
    const payload: any = bidQuery.data as any;
    const bidNode = payload?.bid || payload || null;
    if (!bidNode) return null;

    const educatorNode = bidNode.educator || {};
    const educator: Educator = {
      ...educatorNode,
      id: String(educatorNode.id || bidNode.educatorId || ''),
      name: educatorNode.name || '—',
      email: educatorNode.email || '',
      phone: educatorNode.phone || '',
      city: educatorNode.city || '',
      address: educatorNode.address || '',
      avatarUrl: educatorNode.avatarUrl || '',
      registrationDate: educatorNode.registrationDate || '',
      status: educatorNode.status || 'ACTIVE',
      profile: {
        ...DEFAULT_EDUCATOR_PROFILE,
        ...(educatorNode.basicInfo || {}),
        ...(educatorNode.profile || {}),
        experienceLevel: educatorNode.profile?.experienceLevel
          ?? educatorNode.basicInfo?.experienceLevel
          ?? educatorNode.experienceLevel
          ?? null,
      },
      rating: Number(educatorNode.rating || 0),
      discipline: educatorNode.discipline || 'general',
      country: educatorNode.country || 'sa',
      languages: ensureArray(educatorNode.languages),
      skills: ensureArray(educatorNode.skills),
    } as any;

    const bid: Bid = {
      id: String(bidNode.id),
      projectId: String(bidNode.projectId || bidNode.project?.id || ''),
      educatorId: String(bidNode.educatorId || educator.id),
      proposal: String(bidNode.proposal || ''),
      deliveryDays: Number(bidNode.deliveryDays || 0),
      createdAt: String(bidNode.createdAt || bidNode.created_at || ''),
      bidTasks: Array.isArray(bidNode.bidTasks)
        ? bidNode.bidTasks.map((bt: any) => ({
            taskId: String(bt.taskId || bt.task?.id),
            amount: Number(bt.amount || 0),
            status: String(bt.status || 'PENDING').toUpperCase() as any,
            rejectionReason: bt.rejection_reason || bt.rejectionReason,
            approvalMessage: bt.approval_message || bt.approvalMessage,
            bidTaskId: String(bt.id)
          } as PricedBidTask))
        : [],
      attachments: Array.isArray(bidNode.attachments) ? bidNode.attachments.map(mapAttachment) : [],
      links: Array.isArray(bidNode.links)
        ? (bidNode.links.flat?.() || bidNode.links).map((l: any, i: number) => ({ id: String(l.id || i), title: l.title, url: l.url }))
        : [],
      modificationRequests: Array.isArray(bidNode.modificationRequests) ? bidNode.modificationRequests : [],
    };

    const tasksFromBid: Task[] = (bidNode.bidTasks || []).map((bt: any) => {
      const t = bt.task || {};
      return {
        id: String(t.id || bt.taskId),
        title: t.title || '',
        description: t.description || '',
        status: (t.status || 'PENDING') as any,
        assignments: [],
        budget: typeof t.budget === 'number' ? t.budget : (t.budget ? Number(t.budget) : null),
        deadline: t.deadline || '',
        isPublic: true,
        biddingStatus: t.biddingStatus || 'OPEN',
        subTasks: Array.isArray(t.subTasks) ? t.subTasks.map((st: any) => ({ id: String(st.id), title: st.title, completed: false, createdBy: 'admin', createdAt: st.uploadedAt || '' })) : [],
        attachments: [],
        deliverables: [],
        notes: [],
        creationDate: bid.createdAt,
        activityLog: []
      } as Task;
    });

    const project: Project = {
      id: String(bidNode.project?.id || bid.projectId),
      title: String(bidNode.project?.title || ''),
      description: String(bidNode.project?.description || ''),
      status: 'PENDING' as any,
      tags: Array.isArray(bidNode.project?.tags) ? bidNode.project.tags : [],
      budget: null,
      isPublished: true,
      tasks: tasksFromBid,
      creationType: 'CUSTOM' as any,
      createdBy: '',
      createdAt: bid.createdAt,
      deadline: null,
      educationalRequestId: null,
      activityLog: []
    };

    return { bid, project, educator };
  }, [bidQuery.data]);

  const handleTaskStatus = async (bidIdParam: string, taskId: string, newStatus: BidStatus, details?: { reason?: string; approvalMessage?: string; assignmentAgreement?: string; }) => {
    const bidData = mapped?.bid;
    if (!bidData) return false;

    try {
      const bidTask = bidData.bidTasks.find(x => x.taskId === taskId);
      if (!bidTask?.bidTaskId || bidTask.bidTaskId === 'undefined') {
        throw new Error(t('toasts.bidTaskNotFound'));
      }

      if (newStatus === BidStatus.APPROVED) {
        await approveTask.mutateAsync({ bidId: bidData.id, bidTaskId: bidTask.bidTaskId, feedback: details?.approvalMessage });
      } else if (newStatus === BidStatus.REJECTED) {
        await rejectTask.mutateAsync({ bidId: bidData.id, bidTaskId: bidTask.bidTaskId, reason: details?.reason || '' });
      } else if (newStatus === BidStatus.ASSIGNED) {
        await adminService.assignBidTaskById(bidTask.bidTaskId, bidData.educatorId, details?.assignmentAgreement || undefined);
      } else {
        return false;
      }

      await QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, bidData.id);
      addToast(t('toasts.bidStatusUpdated'));
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('toasts.bidStatusUpdateFailed'), 'error');
      return false;
    }
  };

  const handleModificationDecision = async (requestId: string, decision: 'APPROVED' | 'REJECTED', decisionNote?: string) => {
    if (!mapped?.bid) return;
    try {
      await decideModification.mutateAsync({ id: requestId, bidId: mapped.bid.id, decision, decisionNote });
      await QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, mapped.bid.id);
      addToast(t(decision === 'APPROVED'
        ? 'toasts.bidModificationApproved'
        : 'toasts.bidModificationRejected'));
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : t('toasts.bidModificationDecisionFailed'),
        'error'
      );
      throw error;
    }
  };

  if (bidQuery.isLoading) return <LoadingScreen />;
  if (bidQuery.isError) return <ErrorBoundary error={bidQuery.error as any} />;
  if (!mapped) return <div className="p-4 text-center text-sm text-gray-500">{t('common.bidNotFound')}</div>;

  return (
    <AdminBidDetailView
      bid={mapped.bid}
      project={mapped.project}
      educator={mapped.educator}
      allBids={[mapped.bid]}
      navigateTo={navigateTo}
      onUpdateBidTaskStatus={handleTaskStatus}
      onDecideModificationRequest={handleModificationDecision}
    />
  );
};

export default BidDetailContainer;

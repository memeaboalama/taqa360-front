import React, { useState, useMemo } from 'react';
import { Project, Bid, BidStatus, Educator, Task, PricedBidTask, ViewType } from '../../../shared/types';
import { StarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, LockClosedIcon, LockOpenIcon, UserCheckIcon, EyeIcon, ChatBubbleLeftRightIcon } from '../../../shared/components/Icons';
import StatusUpdateModal from '../components/modals/StatusUpdateModal';
import ApprovalMessageModal from '../components/modals/ApprovalMessageModal';
import Avatar from '../../../shared/components/Avatar';
import AssignmentAgreementModal from '../components/modals/AssignmentAgreementModal';
import { useMemo, useState } from 'react';

interface BidsViewProps {
  project: Project;
  bids: Bid[];
  educators: Educator[];
  navigateTo: (view: ViewType, id?: string) => void;
  onUpdateBidTaskStatus: (bidId: string, taskId: string, newStatus: BidStatus, details?: { reason?: string; approvalMessage?: string; assignmentAgreement?: string; }) => void;
  onUpdateTaskBiddingStatus: (projectId: string, taskId: string) => void;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} filled={i < Math.round(rating)} />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ms-1.5 font-semibold">({rating.toFixed(1)})</span>
        </div>
    );
};

const ProviderBidCard: React.FC<{
    bid: Bid;
    bidTask: PricedBidTask;
    educator?: Educator;
    navigateTo: (view: ViewType, id?: string) => void;
    onUpdateStatus: (bidId: string, taskId: string, newStatus: BidStatus, details: any) => void;
}> = ({ bid, bidTask, educator, navigateTo, onUpdateStatus }) => {
    if (!educator) return null;
    
    const [action, setAction] = useState<'reject' | 'approve' | 'assign' | null>(null);

    const handleAction = (newStatus: BidStatus) => {
        const wasApproved = bidTask.status === BidStatus.APPROVED;
        
        if (newStatus === BidStatus.APPROVED) {
            setAction('approve');
        } else if (newStatus === BidStatus.ASSIGNED) {
            setAction('assign');
        } else if (newStatus === BidStatus.REJECTED || wasApproved) {
            setAction('reject');
        } else {
             onUpdateStatus(bid.id, bidTask.taskId, newStatus, {});
        }
    }
    
    const totalBidAmount = useMemo(() => bid.bidTasks.reduce((acc, t) => acc + t.amount, 0), [bid.bidTasks]);

    return (
        <>
        {action === 'reject' && <StatusUpdateModal
                isOpen={true}
                onClose={() => setAction(null)}
                title="تأكيد الرفض/التراجع"
                description={`يرجى تأكيد رفض العرض أو التراجع عن القبول للمتخصص ${educator.name}`}
                label="سبب الرفض/التراجع"
                onSubmit={(reason) => { onUpdateStatus(bid.id, bidTask.taskId, BidStatus.REJECTED, { reason }); setAction(null); }}
                icon={<XCircleIcon className="w-8 h-8"/>}
                isReasonRequired={bidTask.status === BidStatus.APPROVED}
            />}
        {action === 'approve' && <ApprovalMessageModal 
                isOpen={true}
                onClose={() => setAction(null)}
                onSubmit={(approvalMessage) => { onUpdateStatus(bid.id, bidTask.taskId, BidStatus.APPROVED, { approvalMessage }); setAction(null); }}
             />}
        {action === 'assign' && <AssignmentAgreementModal
                isOpen={true}
                onClose={() => setAction(null)}
                onSubmit={(assignmentAgreement) => { onUpdateStatus(bid.id, bidTask.taskId, BidStatus.ASSIGNED, { assignmentAgreement }); setAction(null); }}
            />}

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3.5 border dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4 flex-grow w-full">
                <Avatar src={educator.avatarUrl} name={educator.name} size={48} className="rounded-full flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                       <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('bidDetail', bid.id); }} className="font-bold text-sm text-gray-800 dark:text-white hover:underline truncate">{educator.name}</a>
                    </div>
                    <div className="mt-0.5">
                        <RatingStars rating={educator.rating} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        <ChatBubbleLeftRightIcon className="w-3 h-3 inline-block me-1"/>
                        {bid.proposal}
                    </p>
                </div>
            </div>
             <div className="text-center flex-shrink-0 mx-auto sm:mx-0 sm:w-32">
                <p className="font-bold text-green-600 text-lg">{bidTask.amount.toLocaleString()} ريال</p>
                <p className="text-xs text-gray-400">للمهمة الحالية</p>
                 <p className="text-xs text-gray-400">(الإجمالي: {totalBidAmount.toLocaleString()} ريال)</p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto">
                <button onClick={() => navigateTo('bidDetail', bid.id)} className="p-2 text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-lg"><EyeIcon className="w-4 h-4"/></button>
                <button onClick={() => handleAction(BidStatus.REJECTED)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded-lg">رفض</button>
                <button onClick={() => handleAction(BidStatus.APPROVED)} className="px-3 py-1.5 text-xs font-bold text-white bg-yellow-50 hover:bg-yellow-100 rounded-lg" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>قبول</button>
                <button onClick={() => handleAction(BidStatus.ASSIGNED)} className="flex items-center px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm">
                    <UserCheckIcon className="w-4 h-4 me-1" />
                    تعيين
                </button>
            </div>
        </div>
        </>
    );
};

const AssignedBidCard: React.FC<{
    bid: Bid;
    bidTask: PricedBidTask;
    educator: Educator;
    onUnassign: () => void;
}> = ({ bid, bidTask, educator, onUnassign }) => {
    return (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3.5 border border-green-200 dark:border-green-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-grow w-full">
                <Avatar src={educator.avatarUrl} name={educator.name} size={48} className="rounded-full flex-shrink-0 border-2 border-green-300" />
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-green-800 dark:text-green-200 truncate">{educator.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100">
                            <UserCheckIcon className="w-3 h-3 me-1"/> معين
                        </span>
                        <RatingStars rating={educator.rating} />
                    </div>
                </div>
            </div>
            <div className="text-center flex-shrink-0 mx-auto sm:mx-0 sm:w-32">
                <p className="font-bold text-green-700 dark:text-green-300 text-lg">{bidTask.amount.toLocaleString()} ريال</p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto">
                 <button onClick={onUnassign} className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded-lg">
                    <XCircleIcon className="w-4 h-4 me-1" />
                    إلغاء التعيين
                </button>
            </div>
        </div>
    );
}


const TaskBidsSection: React.FC<{
    task: Task;
    bids: Bid[];
    educators: Educator[];
    navigateTo: (view: ViewType, id?: string) => void;
    onUpdateBidTaskStatus: (bidId: string, taskId: string, newStatus: BidStatus, details: any) => void;
    onUpdateTaskBiddingStatus: (projectId: string, taskId: string) => void;
    projectId: string;
}> = ({ task, bids, educators, navigateTo, onUpdateBidTaskStatus, onUpdateTaskBiddingStatus, projectId }) => {
    
    const [activeTab, setActiveTab] = useState('pending');
    const [unassignAction, setUnassignAction] = useState<{ bidId: string, taskId: string, educatorName: string } | null>(null);

    const bidsForThisTask = useMemo(() => {
        return bids
            .map(bid => ({ bid, bidTask: bid.bidTasks.find(bt => bt.taskId === task.id) }))
            .filter(item => item.bidTask) as { bid: Bid, bidTask: PricedBidTask }[];
    }, [bids, task.id]);
    
    const getBidsForStatus = (status: BidStatus) => {
        return bidsForThisTask.filter(item => item.bidTask.status === status);
    };

    const assignedBids = getBidsForStatus(BidStatus.ASSIGNED);
    const pendingBids = getBidsForStatus(BidStatus.PENDING);
    const approvedBids = getBidsForStatus(BidStatus.APPROVED);
    const rejectedBids = getBidsForStatus(BidStatus.REJECTED);
    
    const TabButton: React.FC<{name: string, label: string, count: number}> = ({ name, label, count }) => (
        <button onClick={() => setActiveTab(name)} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeTab === name ? 'text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`} style={activeTab === name ? { backgroundColor: 'var(--primary-color)' } : {}}>
            {label} <span className={`ms-1.5 px-2 py-0.5 text-xs rounded-full ${activeTab === name ? 'text-white' : 'bg-gray-200 dark:bg-gray-700'}`} style={activeTab === name ? { backgroundColor: 'var(--primary-color)' } : {}}>{count}</span>
        </button>
    );

    return (
        <>
        {unassignAction && (
             <StatusUpdateModal
                isOpen={true}
                onClose={() => setUnassignAction(null)}
                title="تأكيد إلغاء التعيين"
                description={`يرجى تأكيد إلغاء تعيين ${unassignAction.educatorName} سيعود العرض إلى "مقبول مبدئياً".`}
                label="سبب إلغاء التعيين"
                onSubmit={(reason) => {
                    onUpdateBidTaskStatus(unassignAction.bidId, unassignAction.taskId, BidStatus.APPROVED, { reason });
                    setUnassignAction(null);
                }}
                icon={<XCircleIcon className="w-8 h-8"/>}
                isReasonRequired={true}
            />
        )}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-200 dark:border-gray-700/50">
            <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-white dark:bg-gray-800 rounded-t-xl border-b dark:border-gray-700">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{task.title}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {assignedBids.length > 0 ? `${assignedBids.length} معينين, ` : ''}{bidsForThisTask.length} عرض مقدم
                    </p>
                </div>
                <button onClick={() => onUpdateTaskBiddingStatus(projectId, task.id)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${task.biddingStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {task.biddingStatus === 'OPEN' ? <LockOpenIcon className="w-4 h-4"/> : <LockClosedIcon className="w-4 h-4"/>}
                    {task.biddingStatus === 'OPEN' ? 'تستقبل العروض' : 'مغلقة'}
                </button>
            </div>
            
            {assignedBids.length > 0 && (
                <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
                        المتخصصون المعينون للمهمة
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {assignedBids.map(({ bid, bidTask }) => {
                            const educator = educators.find(e => e.id === bid.educatorId) || (bid as any).educator;
                            if (!educator) return null;
                            return (
                                <div key={`assigned-card-${bid.id}-${bidTask.taskId}`} className="bg-green-50 dark:bg-gray-900 p-3 rounded-lg border border-green-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={educator.avatarUrl} name={educator.name} size={40} className="rounded-full" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white">{educator.name}</p>
                                            <RatingStars rating={educator.rating || 0} />
                                        </div>
                                    </div>
                                    <button onClick={() => navigateTo('bidDetail', bid.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="عرض تفاصيل العرض">
                                        <EyeIcon className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
             <div className="p-4">
                 <div className="flex items-center gap-2 border-b dark:border-gray-700 pb-3 mb-3 flex-wrap">
                    <TabButton name="pending" label="المعلقة" count={pendingBids.length} />
                    <TabButton name="approved" label="المقبولة" count={approvedBids.length} />
                    <TabButton name="assigned" label="المعينون" count={assignedBids.length} />
                    <TabButton name="rejected" label="المرفوضة" count={rejectedBids.length} />
                </div>
                <div className="space-y-3">
                     {activeTab === 'pending' && (pendingBids.length > 0 ? pendingBids.map(({bid, bidTask}) => <ProviderBidCard key={bid.id} bid={bid} bidTask={bidTask} educator={educators.find(e => e.id === bid.educatorId) || (bid as any).educator} navigateTo={navigateTo} onUpdateStatus={onUpdateBidTaskStatus}/>) : <p className="text-center text-xs text-gray-400 py-4">لا توجد عروض معلقة.</p>)}
                     {activeTab === 'approved' && (approvedBids.length > 0 ? approvedBids.map(({bid, bidTask}) => <ProviderBidCard key={bid.id} bid={bid} bidTask={bidTask} educator={educators.find(e => e.id === bid.educatorId) || (bid as any).educator} navigateTo={navigateTo} onUpdateStatus={onUpdateBidTaskStatus}/>) : <p className="text-center text-xs text-gray-400 py-4">لا توجد عروض مقبولة مبدئياً.</p>)}
                     {activeTab === 'assigned' && (assignedBids.length > 0 ? assignedBids.map(({bid, bidTask}) => {
                         const educator = educators.find(e => e.id === bid.educatorId) || (bid as any).educator;
                         if (!educator) return null;
                         return <AssignedBidCard key={bid.id} bid={bid} bidTask={bidTask} educator={educator} onUnassign={() => setUnassignAction({bidId: bid.id, taskId: task.id, educatorName: educator.name})} />
                     }) : <p className="text-center text-xs text-gray-400 py-4">لم يتم تعيين متخصصين بعد.</p>)}
                     {activeTab === 'rejected' && (rejectedBids.length > 0 ? rejectedBids.map(({bid, bidTask}) => <ProviderBidCard key={bid.id} bid={bid} bidTask={bidTask} educator={educators.find(e => e.id === bid.educatorId) || (bid as any).educator} navigateTo={navigateTo} onUpdateStatus={onUpdateBidTaskStatus}/>) : <p className="text-center text-xs text-gray-400 py-4">لا توجد عروض مرفوضة.</p>)}
                </div>
            </div>
        </div>
        </>
    );
};


const BidsView: React.FC<BidsViewProps> = ({ project, bids, educators, navigateTo, onUpdateBidTaskStatus, onUpdateTaskBiddingStatus }) => {
  const publicTasks = project.tasks.filter(task => task.isPublic);

  return (
    <div className="animate-fade-in space-y-6">
        {publicTasks.length > 0 ? (
            publicTasks.map(task => (
                <TaskBidsSection 
                    key={task.id}
                    task={task}
                    bids={bids}
                    educators={educators}
                    navigateTo={navigateTo}
                    onUpdateBidTaskStatus={onUpdateBidTaskStatus}
                    onUpdateTaskBiddingStatus={onUpdateTaskBiddingStatus}
                    projectId={project.id}
                />
            ))
        ) : (
             <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">لا توجد مهام عامة في هذا المشروع لطرح العروض عليها.</p>
            </div>
        )}
    </div>
  );
};
export default BidsView;

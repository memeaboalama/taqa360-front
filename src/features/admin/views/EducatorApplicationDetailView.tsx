import React, { useMemo, useState } from 'react';
import { EducatorApplication, Educator, EducatorStatus, VerifiableDocument, VerificationStatus, ViewType } from '../../../shared/types';
import { ArrowLeftIcon, BriefcaseIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PaperclipIcon, UserCheckIcon, AcademicCapIcon, UserMinusIcon, CheckBadgeIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import Avatar from '../../../shared/components/Avatar';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface EducatorApplicationDetailViewProps {
    application: EducatorApplication;
    educator: Educator;
    navigateTo: (view: ViewType, context?: any) => void;
    onUpdateStatus: (applicationId: string, newStatus: EducatorStatus, reason: string) => void;
    onUpdateDocumentStatus: (applicationId: string, docType: string, docId: string, status: VerificationStatus, reason?: string) => void;
}

const getVerificationStatusInfo = (status: VerificationStatus, t: (key: string) => string) => {
    switch (status) {
        case VerificationStatus.VERIFIED: return { text: t('status.VERIFIED'), color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: <CheckCircleIcon className="w-4 h-4" /> };
        case VerificationStatus.REJECTED: return { text: t('status.REJECTED'), color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: <XCircleIcon className="w-4 h-4" /> };
        default: return { text: t('status.PENDING_REVIEW'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', icon: <ClockIcon className="w-4 h-4" /> };
    }
}

const FilePreviewModal: React.FC<{ fileUrl: string; fileName?: string; onClose: () => void }> = ({ fileUrl, fileName, onClose }) => {
    const isImage = useMemo(() => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl), [fileUrl]);
    const isPDF = useMemo(() => /\.(pdf)$/i.test(fileUrl), [fileUrl]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-4xl h-[80vh] bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-xl">
                <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <PaperclipIcon className="w-5 h-5 text-slate-500" />
                        <div className="text-sm font-semibold text-slate-800 dark:text-white">{fileName || ''}</div>
                    </div>
                    <button onClick={onClose} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">{ 'إغلاق' }</button>
                </div>
                <div className="p-4 h-full">
                    {isImage && <img src={fileUrl} alt={fileName} className="w-full h-full object-contain rounded-md" />}
                    {isPDF && <iframe src={fileUrl} title={fileName} className="w-full h-full rounded-md" />}
                    {!isImage && !isPDF && <div className="w-full h-full flex items-center justify-center text-slate-600">لا يمكن معاينة الملف. يمكنك تنزيله أو فتحه في نافذة جديدة.</div>}
                </div>
            </div>
        </div>
    );
}

const DocumentReviewCard: React.FC<{
    doc: VerifiableDocument,
    onVerify: () => void,
    onReject: (reason: string) => void,
    onPreview?: (fileUrl: string, fileName?: string) => void
}> = ({ doc, onVerify, onReject, onPreview }) => {
    const { t } = useLanguage();
    const [isRejecting, setIsRejecting] = useState(false);
    const statusInfo = getVerificationStatusInfo(doc.status, t);
    return (
        <>
        {isRejecting && <ConfirmationModal
            isOpen={true}
            onClose={() => setIsRejecting(false)}
            onConfirm={(reason) => { onReject(reason); setIsRejecting(false); }}
            title={t('confirm')}
            message={`${t('documentReview.confirmRejectDesc', { name: doc.fileName })}`}
            icon={<XCircleIcon className="w-8 h-8"/>}
            isReasonRequired={false}
            reasonLabel={t('adminBidDetail.rejectionReasonLabel')}
        />}
        <div className="border dark:border-gray-600 rounded-lg p-3 mt-2 bg-brand-light/40 dark:bg-slate-700/50">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <a onClick={() => onPreview && onPreview(doc.fileUrl, doc.fileName)} className="flex items-center gap-2 text-sm text-brand-primary hover:underline cursor-pointer">
                        <PaperclipIcon className="w-4 h-4" /> {doc.fileName}
                    </a>
                    <span className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.icon}{statusInfo.text}</span>
                </div>
                <div className="flex items-center gap-2">
                    {doc.status !== VerificationStatus.VERIFIED && (
                        <>
                            <button onClick={() => setIsRejecting(true)} className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg disabled:opacity-50" disabled={doc.status === VerificationStatus.REJECTED}>{t('reject')}</button>
                            <button onClick={onVerify} className="px-3 py-1 text-xs font-bold text-green-600 bg-green-100 hover:bg-green-200 rounded-lg">{t('status.VERIFIED')}</button>
                        </>
                    )}
                </div>
            </div>
            {doc.rejectionReason && <p className="text-xs text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-md">{t('adminBidDetail.rejectionReason')}: {doc.rejectionReason}</p>}
        </div>
        </>
    );
};

const VerificationChecklistItem: React.FC<{ title: string; isVerified: boolean }> = ({ title, isVerified }) => (
    <li className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${isVerified ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>{title}</span>
        {isVerified ? <CheckBadgeIcon className="w-6 h-6 text-green-500" /> : <ClockIcon className="w-5 h-5 text-yellow-500" />}
    </li>
);

const EducatorApplicationDetailView: React.FC<EducatorApplicationDetailViewProps> = ({ application, educator, navigateTo, onUpdateStatus, onUpdateDocumentStatus }) => {
    const { t } = useLanguage();
    const [action, setAction] = useState<{ status: EducatorStatus, title: string, message: string, icon: React.ReactNode, confirmClass: string } | null>(null);
    const [previewFile, setPreviewFile] = useState<{ url: string; name?: string } | null>(null);

    const handleUpdateStatus = (newStatus: EducatorStatus) => {
        const actionMap: Record<string, any> = {
            [EducatorStatus.ACTIVE]: { title: t('confirm'), message: `${t('educatorsView.confirmStatusChangeTitle', {status: educator?.name || ''})}`, icon: <UserCheckIcon className="w-8 h-8"/>, confirmClass: 'bg-green-600 hover:bg-green-700' },
            [EducatorStatus.REJECTED]: { title: t('confirm'), message: `${t('usersView.confirmDeleteMessage', {name: educator?.name || ''})}`, icon: <UserMinusIcon className="w-8 h-8"/>, confirmClass: 'bg-red-600 hover:bg-red-700' },
        };
        const selectedAction = actionMap[newStatus];
        if (selectedAction) setAction({ status: newStatus, ...selectedAction });
    };

    const confirmStatusUpdate = (reason: string) => {
        if (action) {
            onUpdateStatus(application.id, action.status, reason);
            setAction(null);
        }
    };

    const isIdVerified = application.personalId.status === VerificationStatus.VERIFIED;
    // An empty list is vacuously satisfied — `every` already returns true on [].
    const areCertsVerified = (application.certifications || []).every(c => c.document.status === VerificationStatus.VERIFIED);
    const areExpsVerified = (application.experiences || []).every(e => e.document?.status === VerificationStatus.VERIFIED);

    return (
        <>
        {action && (
            <ConfirmationModal
                isOpen={true}
                onClose={() => setAction(null)}
                onConfirm={confirmStatusUpdate}
                title={action.title}
                message={action.message}
                icon={action.icon}
                isReasonRequired={action.status === EducatorStatus.REJECTED}
                reasonLabel={t('adminBidDetail.rejectionReasonLabel')}
                confirmButtonClass={action.confirmClass}
            />
        )}

        {previewFile && <FilePreviewModal fileUrl={previewFile.url} fileName={previewFile.name} onClose={() => setPreviewFile(null)} />}

        <div className="animate-fade-in">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border dark:border-gray-700 mb-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar src={educator.avatarUrl} name={educator.name} size={80} className="rounded-full" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white">{educator.name}</h1>
                            <p className="text-sm text-slate-600">{educator.discipline}</p>
                            <div className="mt-2">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">{t('status.PENDING_REVIEW')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                        <button onClick={() => handleUpdateStatus(EducatorStatus.REJECTED)} className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">{t('reject')}</button>
                        <button onClick={() => handleUpdateStatus(EducatorStatus.ACTIVE)} className="px-5 py-2 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/90">{t('educatorDashboard.accept')}</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                 {/* Main Content */}
                 <main className="lg:w-2/3 w-full">
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-brand-light/40"><AcademicCapIcon className="w-5 h-5 text-yellow-800"/></div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white">{t('profile.qualifications')}</h3>
                                    <div className="mt-3 space-y-4">
                                        {application.certifications.length > 0 ? (
                                            application.certifications.map(cert => (
                                                <div key={cert.id}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white">{cert.title}</p>
                                                            <p className="text-xs text-slate-500">{cert.issuingAuthority} • {cert.issueDate}</p>
                                                        </div>
                                                    </div>
                                                    <DocumentReviewCard
                                                        doc={cert.document}
                                                        onVerify={() => onUpdateDocumentStatus(application.id, 'certification', cert.id, VerificationStatus.VERIFIED)}
                                                        onReject={(reason) => onUpdateDocumentStatus(application.id, 'certification', cert.id, VerificationStatus.REJECTED, reason)}
                                                        onPreview={(url, name) => setPreviewFile({ url, name })}
                                                    />
                                                </div>
                                            ))
                                        ) : <p className="text-sm text-slate-500">{t('profile.noData')}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-brand-light/40"><BriefcaseIcon className="w-5 h-5 text-yellow-800"/></div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-brand-dark dark:text-white">{t('profile.workExperience')}</h3>
                                    <div className="mt-3 space-y-4">
                                        {application.experiences.length > 0 ? (
                                            application.experiences.map(exp => (
                                                <div key={exp.id}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white">{exp.role} • {exp.company}</p>
                                                            <p className="text-xs text-slate-500">{exp.startDate} - {exp.endDate}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 my-2">{exp.description}</p>
                                                    {exp.document && (
                                                        <DocumentReviewCard
                                                            doc={exp.document}
                                                            onVerify={() => onUpdateDocumentStatus(application.id, 'experience', exp.id, VerificationStatus.VERIFIED)}
                                                            onReject={(reason) => onUpdateDocumentStatus(application.id, 'experience', exp.id, VerificationStatus.REJECTED, reason)}
                                                            onPreview={(url, name) => setPreviewFile({ url, name })}
                                                        />
                                                    )}
                                                </div>
                                            ))
                                        ) : <p className="text-sm text-slate-500">{t('profile.noData')}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                 </main>

                {/* Sidebar */}
                <aside className="lg:w-1/3 w-full space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
                        <h3 className="font-bold mb-3 text-brand-dark dark:text-white">{t('verificationList')}</h3>
                        <ul className="space-y-3">
                           <VerificationChecklistItem title={t('personalId')} isVerified={isIdVerified} />
                           <VerificationChecklistItem title={t('profile.qualifications')} isVerified={areCertsVerified} />
                           <VerificationChecklistItem title={t('profile.workExperience')} isVerified={areExpsVerified} />
                        </ul>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
                        <h3 className="font-bold mb-3 text-brand-dark dark:text-white">{t('basicDocuments')}</h3>
                        <div>
                            <p className="font-semibold text-sm">{t('personalId')}</p>
                            <DocumentReviewCard
                                doc={application.personalId}
                                onVerify={() => onUpdateDocumentStatus(application.id, 'personalId', application.personalId.id, VerificationStatus.VERIFIED)}
                                onReject={(reason) => onUpdateDocumentStatus(application.id, 'personalId', application.personalId.id, VerificationStatus.REJECTED, reason)}
                                onPreview={(url, name) => setPreviewFile({ url, name })}
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
        </>
    );
};

export default EducatorApplicationDetailView;

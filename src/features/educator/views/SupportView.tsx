
import React, { useState, useRef } from 'react';
import { SupportTicket, SupportTicketMessage, Educator, Attachment, SupportTicketStatus } from '../../../shared/types';
import { LifebuoyIcon, PlusIcon, ArrowLeftIcon, SendIcon, PaperclipIcon, UploadCloudIcon, DocumentTextIcon, XCircleIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

type ViewMode = 'list' | 'view';

interface SupportViewProps {
    tickets: SupportTicket[];
    currentUser: Educator;
    onCreateTicket: (data: { category: string; subject: string; message: string; attachments: Omit<Attachment, 'id'>[] }) => void;
    onAddReply: (ticketId: string, replyData: { content: string, attachments: Omit<Attachment, 'id'>[] }) => void;
}

const CreateTicketModal: React.FC<{ isOpen: boolean, onClose: () => void, onSubmit: SupportViewProps['onCreateTicket'] }> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useLanguage();
    // Use stable canonical keys as option values so the payload sent to the API
    // is language-independent; t() is only used for the visible label.
    const categoryOptions = [
        { value: 'technical', label: t('supportTickets.technical') },
        { value: 'financial', label: t('supportTickets.financial') },
        { value: 'projects', label: t('supportTickets.projects') },
        { value: 'other', label: t('supportTickets.other') },
    ];
    const [category, setCategory] = useState(categoryOptions[0].value);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim() && message.trim()) {
            const attachmentData = attachments.map(file => ({
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.type,
                url: URL.createObjectURL(file), // Temporary URL for display
                file: file
            }));
            onSubmit({ category, subject, message, attachments: attachmentData });
            onClose(); // Close modal after submission
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('supportTickets.createTitle')}</h2>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="category" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{t('supportTickets.category')}</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5">
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="subject" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{t('supportTickets.subject')}</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5" />
                    </div>
                     <div>
                        <label htmlFor="message" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{t('supportTickets.message')}</label>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} required className="w-full bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 rounded-lg text-sm p-2.5"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('supportTickets.attachmentsOptional')}</label>
                        <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20" />
                        <div className="flex flex-wrap gap-2 mt-2">
                           {attachments.map((file, index) => (
                               <div key={index} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-xs p-1 px-2 rounded-full">
                                   <span className="text-slate-800 dark:text-slate-200">{file.name}</span>
                                   <button type="button" onClick={() => removeAttachment(index)}><XCircleIcon className="w-4 h-4 text-slate-500 hover:text-red-500"/></button>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-700 dark:hover:bg-slate-600">{t('cancel')}</button>
                         <button type="submit" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }}><SendIcon className="w-4 h-4 me-2"/>{t('submit')}</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const ViewTicket: React.FC<{ ticket: SupportTicket, onBack: () => void, onAddReply: SupportViewProps['onAddReply'], currentUser: Educator }> = ({ ticket, onBack, onAddReply, currentUser }) => {
    const { t } = useLanguage();
    const [reply, setReply] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (reply.trim() || attachments.length > 0) {
            const attachmentData = attachments.map(file => ({
                name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.type, url: URL.createObjectURL(file), file: file
            }));
            onAddReply(ticket.id, { content: reply.trim(), attachments: attachmentData });
            setReply('');
            setAttachments([]);
        }
    };
    
    const MessageCard: React.FC<{ msg: SupportTicketMessage, isFirst: boolean, isLast: boolean }> = ({ msg, isFirst, isLast }) => (
        <div className="ms-5 relative">
            <span className="absolute -start-[19px] top-4 flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full ring-4 ring-white dark:ring-slate-800 dark:bg-slate-700">
                <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full" />
            </span>
            {!isLast && <div className="absolute -start-[3px] top-12 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>}
            <div className="ms-8 bg-white dark:bg-slate-900/50 p-4 rounded-lg border dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{msg.senderName}</p>
                    <time className="text-xs text-slate-400">{msg.timestamp}</time>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-line">{msg.content}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t dark:border-slate-700 space-y-2">
                        {msg.attachments.map(att => (
                            <a href={att.url} key={att.id} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:underline p-2 rounded-md bg-slate-100 dark:bg-slate-800/50" style={{ color: 'var(--primary-color)' }}>
                                <PaperclipIcon className="w-4 h-4"/>
                                <span>{att.name}</span>
                                <span className="text-slate-400">({att.size})</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-sm hover:underline mb-4" style={{ color: 'var(--primary-color)' }}>
                <ArrowLeftIcon className="w-4 h-4 me-1" /> {t('supportView.backToTickets')}
            </button>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3">
                    <div className="relative border-s-2 border-slate-200 dark:border-slate-700 space-y-8">
                       {ticket.messages.map((msg, index) => <MessageCard key={index} msg={msg} isFirst={index === 0} isLast={index === ticket.messages.length - 1} />)}
                    </div>
                </div>
                <div className="lg:w-1/3">
                     <div className="sticky top-24 space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                            <h3 className="font-bold mb-3">{t('supportView.ticketDetails')}</h3>
                             <p className="text-sm"><strong>{t('status')}:</strong> {t(`status.${ticket.status}`)}</p>
                             <p className="text-sm"><strong>{t('supportView.department')}:</strong> {ticket.category}</p>
                        </div>
                        {ticket.status === SupportTicketStatus.OPEN && (
                            <form onSubmit={handleReply} className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 space-y-3">
                                <h3 className="font-bold">{t('supportView.addReply')}</h3>
                                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder={t('supportView.typeReply')} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-sm"/>
                                <div>
                                    <input type="file" multiple onChange={handleFileChange} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20" />
                                    <div className="flex flex-wrap gap-1 mt-1">
                                       {attachments.map((file, index) => <div key={index} className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-[10px] p-0.5 px-1.5 rounded-full">{file.name} <button type="button" onClick={() => removeAttachment(index)}><XCircleIcon className="w-3 h-3"/></button></div>)}
                                    </div>
                                </div>
                                <button type="submit" className="w-full flex items-center justify-center p-2 text-white rounded-md text-sm font-semibold" style={{ backgroundColor: 'var(--primary-color)' }}><SendIcon className="w-4 h-4 me-2"/>{t('submit')}</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const TicketRow: React.FC<{ ticket: SupportTicket; onView: () => void }> = ({ ticket, onView }) => {
    const { t } = useLanguage();
    const isOpen = ticket.status === SupportTicketStatus.OPEN;
    return (
        <tr onClick={onView} className="border-b dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">#{ticket.id.slice(-4)}</td>
            <td className="px-6 py-4">
                <p className="font-semibold text-slate-900 dark:text-white">{ticket.subject}</p>
                <p className="text-xs text-slate-500">{ticket.createdAt}</p>
            </td>
            <td className="px-6 py-4">{ticket.category}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {t(`status.${ticket.status}`)}
                </span>
            </td>
            <td className="px-6 py-4">{ticket.lastReply}</td>
        </tr>
    );
};

const SupportView: React.FC<SupportViewProps> = ({ tickets, currentUser, onCreateTicket, onAddReply }) => {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setViewMode('view');
    };

    if (viewMode === 'view' && selectedTicket) {
        return <ViewTicket ticket={selectedTicket} onBack={() => setViewMode('list')} onAddReply={onAddReply} currentUser={currentUser} />;
    }
    
    return (
        <div className="animate-fade-in">
            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={onCreateTicket} />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('support')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('supportView.subtitle')}</p>
                </div>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-white rounded-lg shadow-md" style={{ backgroundColor: 'var(--primary-color)' }}>
                    <PlusIcon className="w-5 h-5 me-2" />
                    {t('supportView.openTicket')}
                </button>
            </div>
            <div className="relative overflow-x-auto bg-white dark:bg-slate-800 sm:rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('supportView.ticketNumber')}</th>
                            <th scope="col" className="px-6 py-3">{t('supportView.subject')}</th>
                            <th scope="col" className="px-6 py-3">{t('supportView.category')}</th>
                            <th scope="col" className="px-6 py-3">{t('status')}</th>
                            <th scope="col" className="px-6 py-3">{t('supportView.lastReply')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} onView={() => handleViewTicket(ticket)} />)}
                         {tickets.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-slate-500">{t('supportView.noTickets')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupportView;

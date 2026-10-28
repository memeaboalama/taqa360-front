import React, { useState, useEffect } from 'react';
import { SupportTicket, Educator, SupportTicketMessage, Attachment, SupportTicketStatus } from '../../../shared/types';
import { LifebuoyIcon, ArrowLeftIcon, SendIcon, PaperclipIcon, XCircleIcon, BriefcaseIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';

interface SupportTicketsViewProps {
    tickets: SupportTicket[];
    educators: Educator[];
    onAddReply: (ticketId: string, replyData: { content: string, attachments: Omit<Attachment, 'id'>[] }) => void;
    onUpdateStatus: (ticketId: string, newStatus: SupportTicketStatus) => void;
}

const TicketListItem: React.FC<{
    ticket: SupportTicket;
    educatorName: string;
    educatorAvatar: string;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ ticket, educatorName, educatorAvatar, isSelected, onSelect }) => {
    const { t } = useLanguage();
    const isOpen = ticket.status === SupportTicketStatus.OPEN;
    return (
        <button
            onClick={onSelect}
            className={`w-full text-right p-3 rounded-lg flex items-start gap-3 transition-colors ${
                isSelected ? 'bg-yellow-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
        >
            <Avatar src={educatorAvatar} name={educatorName} size={40} className="rounded-full flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{educatorName}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isOpen ? 'bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {t(`status.${ticket.status}`)}
                    </span>
                </div>
                <p className="font-semibold text-xs text-gray-700 dark:text-gray-300 truncate mt-1">{ticket.subject}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.messages[ticket.messages.length - 1]?.content ?? ''}</p>
            </div>
        </button>
    );
};

const MessageCard: React.FC<{ msg: SupportTicketMessage }> = ({ msg }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <Avatar src={msg.senderAvatar} name={msg.senderName} size={40} className="rounded-full" />
                <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{msg.senderName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{msg.sender === 'admin' ? 'فريق الدعم' : 'متخصص'}</p>
                </div>
            </div>
            <time className="text-xs text-gray-400">{msg.timestamp}</time>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">{msg.content}</p>
        {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2">
                {msg.attachments.map(att => (
                    <a href={att.url} key={att.id} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:underline p-2 rounded-md bg-gray-100 dark:bg-gray-800/50" style={{ color: 'var(--primary-color)' }}>
                        <PaperclipIcon className="w-4 h-4" />
                        <span>{att.name}</span>
                        <span className="text-gray-400">({att.size})</span>
                    </a>
                ))}
            </div>
        )}
    </div>
);

const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({ tickets, educators, onAddReply, onUpdateStatus }) => {
    const { t } = useLanguage();
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [reply, setReply] = useState('');
    const [search, setSearch] = useState('');

    const filteredTickets = search.trim()
        ? tickets.filter(ticket => {
            const educator = educators.find(e => e.id === ticket.educatorId);
            const q = search.trim().toLowerCase();
            return (ticket.subject || '').toLowerCase().includes(q)
                || (educator?.name || '').toLowerCase().includes(q);
        })
        : tickets;

    useEffect(() => {
        if (!selectedTicket && tickets.length > 0) {
            setSelectedTicket(tickets[0]);
        } else if (selectedTicket) {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            } else {
                setSelectedTicket(tickets[0] || null);
            }
        }
    }, [tickets]);


    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTicket && reply.trim()) {
            onAddReply(selectedTicket.id, { content: reply.trim(), attachments: [] });
            setReply('');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('support')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('supportTickets.subtitle')}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 flex flex-col md:flex-row h-[calc(100vh-12rem)] min-h-[500px]">
                {/* Tickets List */}
                <aside className="w-full md:w-1/3 lg:w-1/4 border-s dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700">
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('supportTickets.search')} className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 text-sm"/>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2 space-y-1">
                        {filteredTickets.map(ticket => {
                            const educator = educators.find(e => e.id === ticket.educatorId);
                            if (!educator) return null;
                            return (
                                <TicketListItem
                                    key={ticket.id}
                                    ticket={ticket}
                                    educatorName={educator.name}
                                    educatorAvatar={educator.avatarUrl}
                                    isSelected={selectedTicket?.id === ticket.id}
                                    onSelect={() => setSelectedTicket(ticket)}
                                />
                            );
                        })}
                    </div>
                </aside>

                {/* Ticket Details */}
                <main className="flex-1 flex flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="p-4 border-b dark:border-gray-700 flex-shrink-0 flex justify-between items-center">
                                <div className="overflow-hidden">
                                    <h2 className="font-bold text-lg truncate">{selectedTicket.subject}</h2>
                                    <p className="text-sm text-gray-500">
                                        {t('supportTickets.ticket')} #{selectedTicket.id.slice(-4)} &bull; {selectedTicket.category}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedTicket.status === SupportTicketStatus.OPEN ? (
                                        <button onClick={() => onUpdateStatus(selectedTicket.id, SupportTicketStatus.CLOSED)} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                                            {t('supportTickets.closeTicket')}
                                        </button>
                                    ) : (
                                        <button onClick={() => onUpdateStatus(selectedTicket.id, SupportTicketStatus.OPEN)} className="px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                            {t('supportTickets.reopenTicket')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                                {selectedTicket.messages.map((msg, index) => <MessageCard key={index} msg={msg} />)}
                            </div>
                            
                            {selectedTicket.status === SupportTicketStatus.OPEN && (
                                <form onSubmit={handleReply} className="p-3 border-t dark:border-gray-700 flex-shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50">
                                   <input 
                                       type="text" 
                                       value={reply}
                                       onChange={e => setReply(e.target.value)}
                                       placeholder={t('supportTickets.typeReply')} 
                                       className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md text-sm p-2 text-gray-900 dark:text-white" 
                                    />
                                   <button type="submit" className="p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:bg-slate-400">
                                       <SendIcon className="w-5 h-5"/>
                                   </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                            <LifebuoyIcon className="w-16 h-16"/>
                            <p className="mt-4 font-semibold">{t('supportTickets.selectTicket')}</p>
                            <p className="text-sm">{t('supportTickets.selectTicketDesc')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SupportTicketsView;

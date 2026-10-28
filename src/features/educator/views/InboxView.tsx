
import React, { useState } from 'react';
import { InboxMessage } from '../../../shared/types';
import { EnvelopeIcon, SendIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface InboxViewProps {
    messages: InboxMessage[];
}

const MessageBubble: React.FC<{ message: InboxMessage }> = ({ message }) => {
    const { t } = useLanguage();
    const isFromAdmin = message.from === 'ADMIN';
    return (
        <div className={`flex items-start gap-3 ${isFromAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isFromAdmin ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200' : 'bg-green-600 text-white'}`}>
                {isFromAdmin ? 'A' : t('inbox.me')}
            </div>
            <div className={`flex-grow max-w-xs md:max-w-md p-3 rounded-lg ${isFromAdmin ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'bg-green-600 text-white'}`}>
                <p className="text-sm">{message.content}</p>
                <time className={`text-xs mt-1 block ${isFromAdmin ? 'text-slate-500 dark:text-slate-400' : 'text-green-200'}`}>{message.timestamp}</time>
            </div>
        </div>
    );
};

const InboxView: React.FC<InboxViewProps> = ({ messages }) => {
    const { t } = useLanguage();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim()){
            console.log('Sending message:', newMessage);
            setNewMessage('');
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('inbox')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('inbox.subtitle')}</p>
            </div>
            
            <div className="mt-6 sm:mt-8 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-[70vh]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{t('inbox.conversationTitle')}</h2>
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-800">
                        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-white dark:bg-slate-900 rounded-b-xl">
                       <input 
                           type="text" 
                           value={newMessage}
                           onChange={e => setNewMessage(e.target.value)}
                           placeholder={t('inbox.placeholder')} 
                           className="w-full bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md text-sm p-2 text-slate-900 dark:text-white" 
                        />
                       <button type="submit" className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-800">
                           <SendIcon className="w-5 h-5"/>
                       </button>
                   </form>
                </div>
            </div>
        </div>
    );
};

export default InboxView;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Spinner from './Spinner';
import SendIcon from './icons/SendIcon';
import EraserIcon from './icons/EraserIcon';

interface ChatInterfaceProps {
    grade: string;
    subject: string;
    history: ChatMessage[];
    isQueryLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ grade, subject, history, isQueryLoading, onSendMessage, onNewChat }) => {
    const [query, setQuery] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2">${paraBuffer}</p>`;
                paraBuffer = '';
            }
        }

        function flushList() {
            if (listType) {
                html += `</${listType}>`;
                listType = null;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-gem-mist/50 px-1 py-0.5 rounded-sm font-mono text-sm">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-2 pr-5 space-y-1">';
                    listType = 'ol';
                }
                html += `<li>${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-2 pr-5 space-y-1">';
                    listType = 'ul';
                }
                html += `<li>${isUl[1]}</li>`;
            } else {
                flushList();
                if (line.trim() === '') {
                    flushPara();
                } else {
                    paraBuffer += (paraBuffer ? '<br/>' : '') + line;
                }
            }
        }

        flushPara();
        flushList();

        return { __html: html };
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSendMessage(query);
            setQuery('');
        }
    };

    const handleSourceClick = (text: string) => {
        setModalContent(text);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isQueryLoading]);

    return (
        <div className="flex flex-col h-full relative">
            <header className="absolute top-0 left-0 right-0 p-4 bg-gem-onyx/80 backdrop-blur-sm z-10 flex justify-between items-center border-b border-gem-mist">
                <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold text-gem-offwhite truncate" title={`مادة ${subject} - ${grade}`}>مادة {subject} - {grade}</h1>
                    <button
                        onClick={onNewChat}
                        className="flex items-center px-4 py-2 bg-gem-blue hover:bg-blue-500/90 rounded-full text-white transition-colors flex-shrink-0"
                        title="إنهاء الدردشة الحالية وبدء دردشة جديدة"
                    >
                        <EraserIcon />
                        <span className="mr-2 hidden sm:inline">دردشة جديدة</span>
                    </button>
                </div>
            </header>

            <div className="flex-grow pt-24 pb-24 overflow-y-auto px-4">
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    {history.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl ${
                                message.role === 'user' 
                                ? 'bg-gem-blue text-white' 
                                : 'bg-gem-slate'
                            }`}>
                                <div dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)} />
                                {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gem-mist/50">
                                        <h4 className="text-xs font-semibold text-gem-offwhite/70 mb-2 text-left">المصادر:</h4>
                                        <div className="flex flex-wrap gap-2 justify-start">
                                            {message.groundingChunks.map((chunk, chunkIndex) => (
                                                chunk.retrievedContext?.text && (
                                                    <button
                                                        key={chunkIndex}
                                                        onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                        className="bg-gem-mist/50 hover:bg-gem-mist text-gem-offwhite text-xs px-3 py-1 rounded-md transition-colors"
                                                        aria-label={`عرض المصدر ${chunkIndex + 1}`}
                                                        title="عرض جزء من المستند المصدر"
                                                    >
                                                        مصدر {chunkIndex + 1}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isQueryLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl bg-gem-slate flex items-center">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gem-onyx/80 backdrop-blur-sm">
                 <div className="max-w-4xl mx-auto">
                     <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="اسأل سؤالاً عن المنهج..."
                            className="flex-grow bg-gem-slate border border-gem-mist/50 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-gem-blue"
                            disabled={isQueryLoading}
                        />
                        <button type="submit" disabled={isQueryLoading || !query.trim()} className="p-3 bg-gem-blue hover:bg-blue-500/90 rounded-full text-white disabled:bg-gem-mist transition-colors" title="إرسال الرسالة">
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>

            {modalContent !== null && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
                    onClick={closeModal} 
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="source-modal-title"
                >
                    <div className="bg-gem-slate text-gem-offwhite p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h3 id="source-modal-title" className="text-xl font-bold mb-4">النص المصدر</h3>
                        <div 
                            className="flex-grow overflow-y-auto pr-4 text-gem-offwhite/80 border-t border-b border-gem-mist py-4"
                            dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                        >
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={closeModal} className="px-6 py-2 rounded-md bg-gem-blue hover:bg-blue-500/90 text-white transition-colors" title="إغلاق عرض المصدر">
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
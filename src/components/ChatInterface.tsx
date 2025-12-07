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

// Avatar components
const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-blue to-blue-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-teal to-teal-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
        </svg>
    </div>
);

// Typing indicator component
const TypingIndicator = () => (
    <div className="flex space-x-1 rtl:space-x-reverse">
        <div className="w-2 h-2 bg-gem-offwhite/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gem-offwhite/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gem-offwhite/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ grade, subject, history, isQueryLoading, onSendMessage, onNewChat }) => {
    const [query, setQuery] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    
    // Render LaTeX math in the content
    const renderMath = (element: HTMLElement) => {
        if (typeof window !== 'undefined' && (window as any).renderMathInElement) {
            try {
                (window as any).renderMathInElement(element, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false,
                    trust: true
                });
            } catch (error) {
                console.warn('KaTeX rendering error:', error);
            }
        }
    };
    
    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2 leading-relaxed">${paraBuffer}</p>`;
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
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong class="font-bold text-gem-offwhite">$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em class="italic">$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-gem-blue/10 text-gem-blue px-2 py-0.5 rounded-md font-mono text-sm">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-3 pr-5 space-y-2">';
                    listType = 'ol';
                }
                html += `<li class="leading-relaxed">${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-3 pr-5 space-y-2">';
                    listType = 'ul';
                }
                html += `<li class="leading-relaxed">${isUl[1]}</li>`;
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
            inputRef.current?.focus();
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

    // Render math equations after messages update
    useEffect(() => {
        messageRefs.current.forEach((element) => {
            if (element) {
                renderMath(element);
            }
        });
    }, [history]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-gem-onyx via-gem-onyx to-blue-50">
            {/* Fixed Header */}
            <header className="flex-shrink-0 bg-gradient-to-r from-gem-blue/95 to-gem-teal/95 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-10">
                <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-3 sm:px-4 py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate" title={`مادة ${subject} - ${grade}`}>
                                {subject} - {grade}
                            </h1>
                            <p className="text-xs text-white/80 hidden sm:block">مساعدك التعليمي الذكي 🎓</p>
                        </div>
                    </div>
                    <button
                        onClick={onNewChat}
                        className="flex items-center px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0 ml-2"
                        title="إنهاء الدردشة الحالية وبدء دردشة جديدة"
                    >
                        <EraserIcon />
                        <span className="mr-2 hidden sm:inline text-sm">دردشة جديدة</span>
                    </button>
                </div>
            </header>            {/* Scrollable Chat Messages Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 pb-safe">
                <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 min-h-0">
                    {history.length === 0 && (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gem-teal to-gem-blue flex items-center justify-center shadow-xl">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gem-offwhite mb-2">مرحباً بك! 👋</h3>
                            <p className="text-gem-offwhite/70 max-w-md mx-auto">
                                أنا هنا لمساعدتك في فهم المنهج. اسألني أي سؤال وسأبذل قصارى جهدي للإجابة عليه!
                            </p>
                        </div>
                    )}
                    
                    {history.map((message, index) => (
                        <div 
                            key={index} 
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 rtl:space-x-reverse max-w-[85%] md:max-w-3xl`}>
                                {/* Avatar */}
                                <div className="mb-1">
                                    {message.role === 'user' ? <UserAvatar /> : <AIAvatar />}
                                </div>
                                
                                {/* Message Bubble */}
                                <div className={`px-5 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                                    message.role === 'user' 
                                    ? 'bg-gradient-to-br from-gem-blue to-blue-500 text-white rounded-br-sm' 
                                    : 'bg-gem-slate text-gem-offwhite rounded-bl-sm border border-gem-mist/30'
                                }`}>
                                    <div 
                                        ref={(el) => {
                                            if (el && message.role === 'model') {
                                                messageRefs.current.set(index, el);
                                            }
                                        }}
                                        className={message.role === 'user' ? 'text-white' : 'text-gem-offwhite'}
                                        dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)} 
                                    />
                                    
                                    {/* Sources Section with improved styling */}
                                    {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gem-mist/30">
                                            <h4 className="text-xs font-semibold text-gem-offwhite/70 mb-2 text-left flex items-center">
                                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                                                </svg>
                                                المصادر
                                            </h4>
                                            <div className="flex flex-wrap gap-2 justify-start">
                                                {message.groundingChunks.map((chunk, chunkIndex) => (
                                                    chunk.retrievedContext?.text && (
                                                        <button
                                                            key={chunkIndex}
                                                            onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                            className="bg-gradient-to-r from-gem-teal/20 to-gem-blue/20 hover:from-gem-teal/30 hover:to-gem-blue/30 text-gem-blue border border-gem-blue/30 text-xs px-3 py-1.5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center"
                                                            aria-label={`عرض المصدر ${chunkIndex + 1}`}
                                                            title="عرض جزء من المستند المصدر"
                                                        >
                                                            <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                                                            </svg>
                                                            مصدر {chunkIndex + 1}
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Enhanced Loading State */}
                    {isQueryLoading && (
                        <div className="flex justify-start animate-slide-up">
                            <div className="flex items-end space-x-2 rtl:space-x-reverse">
                                <div className="mb-1">
                                    <AIAvatar />
                                </div>
                                <div className="px-5 py-4 rounded-2xl bg-gem-slate border border-gem-mist/30 shadow-md">
                                    <TypingIndicator />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Sticky Input Area */}
            <div className="flex-shrink-0 border-t border-gem-mist/30 bg-gem-slate/95 backdrop-blur-md shadow-lg sticky bottom-0 z-10 safe-bottom">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="اكتب سؤالك هنا... 💬"
                            className="flex-1 bg-white border-2 border-gem-mist/50 focus:border-gem-blue rounded-2xl py-2.5 sm:py-3 px-4 sm:px-5 focus:outline-none focus:ring-2 focus:ring-gem-blue/20 transition-all duration-200 text-sm sm:text-base text-gem-offwhite placeholder-gem-offwhite/50 resize-none min-h-[44px]"
                            disabled={isQueryLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isQueryLoading || !query.trim()} 
                            className="p-3 sm:p-3.5 bg-gradient-to-r from-gem-blue to-blue-500 hover:from-blue-500 hover:to-gem-blue rounded-full text-white disabled:from-gem-mist disabled:to-gem-mist transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex-shrink-0 mb-0.5" 
                            title="إرسال الرسالة"
                            aria-label="إرسال"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>

            {/* Enhanced Modal */}
            {modalContent !== null && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
                    onClick={closeModal} 
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="source-modal-title"
                >
                    <div className="bg-gem-slate text-gem-offwhite p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gem-mist/30 animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 id="source-modal-title" className="text-xl font-bold flex items-center">
                                <svg className="w-5 h-5 ml-2 text-gem-teal" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                                </svg>
                                النص المصدر
                            </h3>
                            <button 
                                onClick={closeModal}
                                className="text-gem-offwhite/50 hover:text-gem-offwhite transition-colors"
                                title="إغلاق"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div 
                            className="flex-grow overflow-y-auto pr-4 text-gem-offwhite/80 border-t border-b border-gem-mist/30 py-4 leading-relaxed"
                            dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                        >
                        </div>
                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={closeModal} 
                                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-gem-blue to-blue-500 hover:from-blue-500 hover:to-gem-blue text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105" 
                                title="إغلاق عرض المصدر"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom CSS for animations */}
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes scale-up {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
                
                .animate-scale-up {
                    animation: scale-up 0.2s ease-out forwards;
                }
                
                /* Smooth scrollbar */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 8px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(74, 144, 226, 0.3);
                    border-radius: 4px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(74, 144, 226, 0.5);
                }
                
                /* KaTeX math styling */
                .katex {
                    font-size: 1.1em;
                }
                
                .katex-display {
                    margin: 1em 0;
                    padding: 0.5em;
                    background: rgba(66, 153, 225, 0.05);
                    border-radius: 0.5em;
                    border-right: 3px solid rgba(66, 153, 225, 0.3);
                    overflow-x: auto;
                }
                
                .katex-display > .katex {
                    text-align: center;
                }
                
                /* RTL support for math */
                [dir="rtl"] .katex-display {
                    border-right: none;
                    border-left: 3px solid rgba(66, 153, 225, 0.3);
                }
            `}</style>
        </div>
    );
};

export default ChatInterface;
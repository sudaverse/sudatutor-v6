/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { AppStatus, ChatMessage } from './types';
import * as geminiService from './services/geminiService';
import Spinner from './components/Spinner';
import SelectionScreen from './components/SelectionScreen';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.Initializing);
    const [error, setError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    useEffect(() => {
        try {
            geminiService.initialize();
            setStatus(AppStatus.Selection);
        } catch (err) {
            handleError("فشل التهيئة. يرجى التأكد من أن مفتاح الواجهة البرمجية API Key مُعد بشكل صحيح.", err);
        }
    }, []);

    const handleError = (message: string, err: any) => {
        console.error(message, err);
        setError(`${message}${err ? `: ${err instanceof Error ? err.message : String(err)}` : ''}`);
        setStatus(AppStatus.Error);
    };

    const clearError = () => {
        setError(null);
        setStatus(AppStatus.Selection);
    }

    const handleStartChat = (grade: string, subject: string) => {
        setSelectedGrade(grade);
        setSelectedSubject(subject);
        setChatHistory([]);
        setStatus(AppStatus.Chatting);
    };

    const handleEndChat = () => {
        setSelectedGrade('');
        setSelectedSubject('');
        setChatHistory([]);
        setStatus(AppStatus.Selection);
    };

    const handleSendMessage = async (message: string) => {
        if (!selectedGrade || !selectedSubject) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        const newChatHistory = [...chatHistory, userMessage];
        setChatHistory(newChatHistory);
        setIsQueryLoading(true);

        try {
            const result = await geminiService.fileSearch(selectedGrade, selectedSubject, message, chatHistory);
            const modelMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: result.text }],
                groundingChunks: result.groundingChunks
            };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: "عذراً، لقد واجهت خطأ. يرجى المحاولة مرة أخرى." }]
            };
            setChatHistory(prev => [...prev, errorMessage]);
            handleError("فشل في الحصول على إجابة", err);
        } finally {
            setIsQueryLoading(false);
        }
    };
    
    const renderContent = () => {
        switch(status) {
            case AppStatus.Initializing:
                return (
                    <div className="flex items-center justify-center h-screen">
                        <Spinner /> <span className="mr-4 text-xl">...جاري التهيئة</span>
                    </div>
                );
            case AppStatus.Selection:
                 return <SelectionScreen onStartChat={handleStartChat} />;
            case AppStatus.Chatting:
                return <ChatInterface 
                    grade={selectedGrade}
                    subject={selectedSubject}
                    history={chatHistory}
                    isQueryLoading={isQueryLoading}
                    onSendMessage={handleSendMessage}
                    onNewChat={handleEndChat}
                />;
            case AppStatus.Error:
                 return (
                    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-800">
                        <h1 className="text-3xl font-bold mb-4">خطأ في التطبيق</h1>
                        <p className="max-w-md text-center mb-4">{error}</p>
                        <button onClick={clearError} className="px-4 py-2 rounded-md bg-gem-mist hover:bg-gem-mist/70 transition-colors text-gem-offwhite" title="العودة إلى الشاشة الرئيسية">
                           حاول مرة أخرى
                        </button>
                    </div>
                );
            default:
                 return <SelectionScreen onStartChat={handleStartChat} />;
        }
    }

    return (
        <main className="h-screen bg-gem-onyx text-gem-offwhite">
            {renderContent()}
        </main>
    );
};

export default App;
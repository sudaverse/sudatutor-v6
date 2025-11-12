/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { curriculumData } from '../curriculumData';
import BookIcon from './icons/BookIcon';

interface SelectionScreenProps {
    onStartChat: (grade: string, subject: string) => void;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onStartChat }) => {
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const grades = useMemo(() => Object.keys(curriculumData), []);
    const subjects = useMemo(() => selectedGrade ? curriculumData[selectedGrade as keyof typeof curriculumData] : [], [selectedGrade]);

    const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (selectedGrade && selectedSubject) {
            onStartChat(selectedGrade, selectedSubject);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-xl text-center">
                <div className="flex justify-center items-center mb-6">
                    <BookIcon />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-gem-offwhite">SUDATUTOR</h1>
                <p className="text-gem-offwhite/70 mb-10">
                   مساعدك الدراسي الذكي للمناهج السودانية
                </p>

                <div className="w-full max-w-md mx-auto space-y-4">
                    <div>
                        <label htmlFor="grade-select" className="block text-right text-lg font-medium text-gem-offwhite/90 mb-2">اختر الصف الدراسي</label>
                        <select
                            id="grade-select"
                            value={selectedGrade}
                            onChange={(e) => {
                                setSelectedGrade(e.target.value);
                                setSelectedSubject(''); // Reset subject when grade changes
                            }}
                            className="w-full p-3 rounded-lg border-2 border-gem-mist bg-gem-slate focus:border-gem-blue focus:ring-gem-blue"
                        >
                            <option value="" disabled>-- اختر الصف --</option>
                            {grades.map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="subject-select" className="block text-right text-lg font-medium text-gem-offwhite/90 mb-2">اختر المادة</label>
                        <select
                            id="subject-select"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedGrade}
                            className="w-full p-3 rounded-lg border-2 border-gem-mist bg-gem-slate focus:border-gem-blue focus:ring-gem-blue disabled:bg-gem-mist/50 disabled:cursor-not-allowed"
                        >
                            <option value="" disabled>-- اختر المادة --</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleStartClick}
                        disabled={!selectedGrade || !selectedSubject}
                        className="w-full px-6 py-4 mt-6 rounded-lg bg-gem-blue hover:bg-blue-500/90 text-white font-bold text-xl transition-colors disabled:bg-gem-mist/50 disabled:cursor-not-allowed"
                        title="ابدأ الدردشة"
                    >
                        ابدأ الدردشة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionScreen;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QueryResult, ChatMessage } from '../types';
import CONFIG from '../../config/app.config';

let ai: GoogleGenAI;

export function initialize() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export async function fileSearch(grade: string, subject: string, query: string, history: ChatMessage[]): Promise<QueryResult> {
    if (!ai) throw new Error("Gemini AI not initialized");

    const contents = [...history, { role: 'user', parts: [{text: query}] }];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: CONFIG.GEMINI_MODEL,
        contents: contents,
        config: {
            systemInstruction: `أنت معلم خبير بالمناهج الدراسية السودانية. مهمتك هي الإجابة على أسئلة الطلاب بدقة بناءً على المادة الدراسية المقدمة فقط. استخدم فقط منهج '${subject}' للصف '${grade}'. كن ودودًا وشجع الطالب. لا تستخدم أي معلومات من خارج الوثائق المقدمة. أجب باللغة العربية دائماً، إلا إذا كان السؤال باللغة الإنجليزية.`,
            tools: [
                {
                    fileSearch: {
                        fileSearchStoreNames: [CONFIG.FILE_SEARCH_STORE_NAME],
                    }
                }
            ]
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text,
        groundingChunks: groundingChunks,
    };
}
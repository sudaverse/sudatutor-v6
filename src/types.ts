/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface GroundingChunk {
    retrievedContext?: {
        text?: string;
    };
}

export interface QueryResult {
    text: string;
    groundingChunks: GroundingChunk[];
}

export enum AppStatus {
    Initializing,
    Selection,
    Chatting,
    Error,
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    groundingChunks?: GroundingChunk[];
}

// Fix: Added missing type definitions for RagStore, CustomMetadata, and Document.
export interface RagStore {
    name: string;
    displayName: string;
}

export interface CustomMetadata {
    key: string;
    stringValue: string;
}

export interface Document {
    name: string;
    displayName: string;
    customMetadata?: CustomMetadata[];
}

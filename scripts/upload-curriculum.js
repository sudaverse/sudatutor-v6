/**
 * Script to upload curriculum files to the File Search Store
 * Run with: node upload-curriculum.js <fileSearchStoreName>
 * Example: node upload-curriculum.js fileSearchStores/my-store-123
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FormData, File } from 'formdata-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const CURRICULUM_DIR = './curriculum-data';

// Get store name from command line or use default
const STORE_NAME = process.argv[2] || 'fileSearchStores/sudan-curriculum-file-searc-0yuzv4zzxz09';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadFile(filePath, fileName, storeName) {
    console.log(`Uploading: ${fileName}...`);
    
    try {
        // Read file as buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        // Create FormData with File object (not Blob)
        const formData = new FormData();
        const file = new File([fileBuffer], fileName, { type: 'text/plain' });
        formData.append('file', file);
        
        // Upload to File Search Store
        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/${storeName}:uploadToFileSearchStore?key=${API_KEY}`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log(`  ✓ Uploaded: ${data.response?.documentName || 'success'}`);
        return true;
    } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        return false;
    }
}

async function uploadAllCurriculumFiles() {
    console.log('=== Uploading Curriculum Files to File Search Store ===\n');
    console.log(`Store: ${STORE_NAME}`);
    console.log(`Directory: ${CURRICULUM_DIR}\n`);

    if (!fs.existsSync(CURRICULUM_DIR)) {
        console.error(`❌ Directory not found: ${CURRICULUM_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(CURRICULUM_DIR)
        .filter(file => file.endsWith('.txt'))
        .sort();

    console.log(`Found ${files.length} curriculum files\n`);

    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
        const filePath = path.join(CURRICULUM_DIR, file);
        const success = await uploadFile(filePath, file, STORE_NAME);
        
        if (success) {
            uploaded++;
        } else {
            failed++;
        }

        // Wait 2 seconds between uploads to avoid rate limiting
        await delay(2000);
    }

    console.log('\n=== Upload Complete ===');
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${files.length}`);

    if (failed === 0) {
        console.log('\n✓ All files uploaded successfully!');
        console.log('\nYou can now use the application: npm run dev');
    } else {
        console.log('\n⚠️  Some files failed to upload. Please check the errors above.');
    }
}

async function listDocuments() {
    console.log('\n=== Listing Documents in File Search Store ===\n');
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const documents = data.documents || [];
        
        console.log(`Found ${documents.length} document(s) in store\n`);
        
        if (documents.length > 0) {
            documents.forEach((doc, index) => {
                console.log(`${index + 1}. ${doc.displayName}`);
                console.log(`   Name: ${doc.name}`);
                console.log(`   State: ${doc.state}`);
                console.log(`   Created: ${doc.createTime}\n`);
            });
        }
    } catch (error) {
        console.error('Error listing documents:', error.message);
    }
}

async function getStoreInfo() {
    console.log('\n=== File Search Store Information ===\n');
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}?key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`Name: ${data.name}`);
        console.log(`Display Name: ${data.displayName}`);
        console.log(`Created: ${data.createTime}`);
        console.log(`Active Documents: ${data.activeDocumentsCount || 0}`);
        console.log(`Pending Documents: ${data.pendingDocumentsCount || 0}`);
        console.log(`Failed Documents: ${data.failedDocumentsCount || 0}`);
        console.log(`Total Size: ${data.sizeBytes || 0} bytes`);
    } catch (error) {
        console.error('Error getting store info:', error.message);
    }
}

async function main() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ Please set your GEMINI_API_KEY environment variable or update the API_KEY in this script.');
        console.log('\nOn Windows PowerShell:');
        console.log('  $env:GEMINI_API_KEY="your-api-key-here"');
        console.log('  node upload-curriculum.js');
        process.exit(1);
    }

    const args = process.argv.slice(2);
    
    if (args.includes('--list')) {
        await listDocuments();
    } else if (args.includes('--info')) {
        await getStoreInfo();
    } else {
        await uploadAllCurriculumFiles();
    }
}

main();

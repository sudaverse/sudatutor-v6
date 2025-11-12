/**
 * Test upload a single file to File Search Store
 * Run with: node test-upload.js
 */

import fs from 'fs';
import { FormData, File } from 'formdata-node';

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const STORE_NAME = 'fileSearchStores/sudan-curriculum-file-searc-fjz09esihkms';
const TEST_FILE = './curriculum-data/000_GRADE1_ENGLISH1.txt';

async function testUpload() {
    console.log('Testing file upload to File Search Store...\n');
    
    if (!fs.existsSync(TEST_FILE)) {
        console.error('Test file not found:', TEST_FILE);
        process.exit(1);
    }

    try {
        // Read file
        const fileBuffer = fs.readFileSync(TEST_FILE);
        const fileName = 'test_grade1_english.txt';
        
        // Create FormData with File object
        const formData = new FormData();
        const file = new File([fileBuffer], fileName, { type: 'text/plain' });
        formData.append('file', file);
        
        // Upload URL - using uploadToFileSearchStore
        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/${STORE_NAME}:uploadToFileSearchStore?key=${API_KEY}`;
        
        console.log('Upload URL:', uploadUrl);
        console.log('File:', fileName);
        console.log('Size:', fileBuffer.length, 'bytes\n');
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (response.ok) {
            console.log('\n✓ Upload successful!');
        } else {
            console.log('\n✗ Upload failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUpload();

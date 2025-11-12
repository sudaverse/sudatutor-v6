/**
 * Delete all documents from a File Search Store, then delete the store
 * Run with: node scripts/clean-and-delete-store.js
 */

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const STORE_NAME = 'fileSearchStores/sudan-curriculum-file-searc-0yuzv4zzxz09';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function listDocuments() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}/documents?key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.documents || [];
    } catch (error) {
        console.error('Error listing documents:', error.message);
        return [];
    }
}

async function deleteDocument(docName) {
    try {
        // Use force parameter to delete documents
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${docName}?force=true&key=${API_KEY}`,
            { method: 'DELETE' }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error(`\n  Error: ${error}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`\n  Error deleting ${docName}:`, error.message);
        return false;
    }
}

async function deleteStore() {
    try {
        // Use force parameter to delete store with all documents
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}?force=true&key=${API_KEY}`,
            { method: 'DELETE' }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error('\nStore deletion error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error deleting store:', error.message);
        return false;
    }
}

async function main() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('Please set GEMINI_API_KEY environment variable');
        process.exit(1);
    }

    console.log('=== Force Deleting File Search Store ===\n');
    console.log(`Store: ${STORE_NAME}\n`);

    // Try force delete first (this should delete store with all documents)
    console.log('Attempting force delete of store (with all documents)...');
    let storeDeleted = await deleteStore();

    if (storeDeleted) {
        console.log('✓ File Search Store deleted successfully!\n');
        console.log('You can now create a fresh store with:');
        console.log('  node scripts/create-filestore.js');
        process.exit(0);
    }

    console.log('\nForce delete failed. Trying to delete documents individually...\n');

    // Step 1: List all documents
    console.log('Step 1: Listing documents...');
    const documents = await listDocuments();
    console.log(`Found ${documents.length} documents\n`);

    if (documents.length === 0) {
        console.log('No documents found. Retrying store deletion...\n');
        storeDeleted = await deleteStore();
        if (storeDeleted) {
            console.log('✓ Store deleted successfully!');
            process.exit(0);
        }
    } else {
        // Step 2: Delete all documents with force
        console.log('Step 2: Force deleting all documents...');
        let deleted = 0;
        let failed = 0;

        for (const doc of documents) {
            process.stdout.write(`Deleting: ${doc.displayName || doc.name}... `);
            const success = await deleteDocument(doc.name);
            
            if (success) {
                console.log('✓');
                deleted++;
            } else {
                console.log('✗');
                failed++;
            }

            await delay(500);
        }

        console.log(`\nDeleted ${deleted} documents, ${failed} failed\n`);

        // Wait for deletions to propagate
        console.log('Waiting for deletions to complete...');
        await delay(3000);

        // Try deleting store again
        console.log('Attempting to delete store...');
        storeDeleted = await deleteStore();

        if (storeDeleted) {
            console.log('✓ File Search Store deleted successfully!\n');
            console.log('You can now create a fresh store with:');
            console.log('  node scripts/create-filestore.js');
            process.exit(0);
        }
    }

    console.log('\n✗ Failed to delete File Search Store\n');
    console.log('Options:');
    console.log('1. Wait a few minutes and try again');
    console.log('2. Delete manually from Google AI Studio:');
    console.log('   https://aistudio.google.com/app/apikey');
    console.log('3. Create a new store with a different name');
    process.exit(1);
}

main();

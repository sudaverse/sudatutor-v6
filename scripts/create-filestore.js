/**
 * Create a new File Search Store (fileSearchStores/sudan-curriculum-store-v1)
 * Run with: node create-filestore.js
 */

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const STORE_ID = 'sudan-curriculum-store-v1';
const DISPLAY_NAME = 'Sudan Curriculum File Search Store';

async function main() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('Please set GEMINI_API_KEY environment variable');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${API_KEY}`;
    const body = {
        displayName: DISPLAY_NAME,
        // optionally provide a client-specified id in `storeId` if API supports it; otherwise server will choose
        // Note: some APIs don't allow client-assigned resource id. We pass displayName and check response.
    };

    console.log('Creating File Search Store...');

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✓ File Search Store created successfully!');
            console.log('Store Name:', data.name);
            console.log('Display Name:', data.displayName || DISPLAY_NAME);
            console.log('Create Time:', data.createTime || 'unknown');
            process.exit(0);
        } else {
            const err = await res.json();
            console.error('✗ Failed to create File Search Store:', JSON.stringify(err, null, 2));
            process.exit(1);
        }
    } catch (e) {
        console.error('✗ Network or fetch error:', e.message || e);
        process.exit(1);
    }
}

main();

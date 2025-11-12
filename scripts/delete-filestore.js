/**
 * Delete a File Search Store
 * Run with: node scripts/delete-filestore.js [store-name]
 */

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const STORE_NAME = process.argv[2] || 'fileSearchStores/sudan-curriculum-file-searc-fjz09esihkms';

async function main() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('Please set GEMINI_API_KEY environment variable');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}?key=${API_KEY}`;
    console.log(`Deleting File Search Store: ${STORE_NAME}`);

    try {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) {
            console.log('✓ File Search Store deleted successfully');
            const data = await res.text();
            if (data) console.log('Response:', data);
            process.exit(0);
        } else {
            const err = await res.json();
            console.error('✗ Failed to delete store:', JSON.stringify(err, null, 2));
            process.exit(1);
        }
    } catch (e) {
        console.error('✗ Error:', e.message || e);
        process.exit(1);
    }
}

main();

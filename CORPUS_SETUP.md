# Corpus Setup Guide

This guide will help you create and populate a corpus (RAG store) in Google AI Studio for the Sudan Curriculum Tutor application.

## Prerequisites

1. A valid Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Node.js installed on your system

## Step-by-Step Instructions

### Step 1: Set Your API Key

**On Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

**Alternative:** Edit the scripts directly and replace `'YOUR_API_KEY_HERE'` with your actual API key.

### Step 2: Create the Corpus

Run the corpus creation script:

```powershell
node create-corpus.js
```

This will create a corpus named `corpora/sudan-curriculum-store-v1` in your Google AI Studio account.

**Expected Output:**
```
=== Creating Corpus in Google AI Studio ===

✓ Corpus created successfully!

Corpus Details:
  Name: corpora/sudan-curriculum-store-v1
  Display Name: Sudan Curriculum Store V1
  Create Time: 2025-11-11T...

You can now upload documents to this corpus.
```

**Note:** If the corpus already exists, the script will list all existing corpora.

### Step 3: Upload Curriculum Files

Upload all curriculum files from the `curriculum-data` directory:

```powershell
node upload-curriculum.js
```

This will:
- Read all `.txt` files from `curriculum-data/`
- Upload them to the corpus one by one
- Wait 1 second between uploads to avoid rate limiting

**Expected Output:**
```
=== Uploading Curriculum Files to Corpus ===

Corpus: corpora/sudan-curriculum-store-v1
Directory: ./curriculum-data

Found 80+ curriculum files

Uploading: 000_GRADE1_ENGLISH1.txt...
  ✓ Uploaded: corpora/.../documents/...
Uploading: 002_GRADE1_ARABIC.txt...
  ✓ Uploaded: corpora/.../documents/...
...

=== Upload Complete ===
Uploaded: 80+
Failed: 0
Total: 80+

✓ All files uploaded successfully!
```

**Note:** The upload process may take 1-2 minutes depending on the number of files.

### Step 4: List Documents (Optional)

To verify all documents were uploaded correctly:

```powershell
node upload-curriculum.js --list
```

This will show all documents currently in the corpus.

### Step 5: Create Environment File

Create a `.env.local` file in the project root:

```powershell
New-Item -Path .env.local -ItemType File
Add-Content -Path .env.local -Value "GEMINI_API_KEY=your-api-key-here"
```

Or manually create `.env.local` with:
```
GEMINI_API_KEY=your-api-key-here
```

### Step 6: Run the Application

```powershell
npm run dev
```

The application will now be able to query the corpus and provide answers based on the Sudanese curriculum!

## Troubleshooting

### Error: "ALREADY_EXISTS"
The corpus already exists. You can either:
- Use the existing corpus (skip to Step 3)
- Delete the old corpus and create a new one

### Error: "PERMISSION_DENIED" or "UNAUTHENTICATED"
- Check that your API key is correct
- Ensure the API key has not expired
- Verify you have API access enabled in Google AI Studio

### Error: "RESOURCE_EXHAUSTED"
You've hit a rate limit. The upload script already includes delays, but you may need to:
- Wait a few minutes and try again
- Reduce the upload speed by increasing the delay in `upload-curriculum.js`

### No documents showing up
- Make sure you completed Step 3 (upload)
- Run `node upload-curriculum.js --list` to verify uploads
- Check that the `curriculum-data` directory exists and contains `.txt` files

## Corpus Management

### Delete All Documents
If you need to start fresh, you can delete the corpus and recreate it:

```javascript
// Delete corpus (use with caution!)
fetch(`https://generativelanguage.googleapis.com/v1beta/corpora/sudan-curriculum-store-v1?key=${API_KEY}`, {
    method: 'DELETE'
});
```

Then re-run Steps 2 and 3.

## Additional Information

- **Corpus Name:** `corpora/sudan-curriculum-store-v1`
- **Format:** Text files (`.txt`)
- **Total Files:** 80+ curriculum documents
- **Coverage:** Grades 1-12, all subjects
- **Languages:** Arabic and English

## Next Steps

Once the corpus is set up and the application is running:
1. Select a grade and subject
2. Start asking questions about the curriculum
3. The AI will respond based solely on the uploaded curriculum materials

Enjoy using المعلم السوداني! 🎓

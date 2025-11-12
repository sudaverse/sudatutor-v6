# المعلم السوداني (Sudanese Teacher)<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<div align="center"></div>



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)# Run and deploy your AI Studio app

![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)This contains everything you need to run your app locally.



**AI-powered educational tutor for the Sudanese curriculum**View your app in AI Studio: https://ai.studio/apps/drive/17rSjJTkUF_dHI5VIErp9OP2TwMkGkm2E



مساعد تعليمي ذكي مدعوم بالذكاء الاصطناعي للمناهج السودانية## Run Locally



[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)**Prerequisites:**  Node.js



</div>

1. Install dependencies:

---   `npm install`

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

## 📖 Overview3. Run the app:

   `npm run dev`

**المعلم السوداني** is an intelligent educational assistant specifically designed for students following the Sudanese curriculum (Grades 1-12). Powered by Google's Gemini 2.5 Flash with File Search capabilities, it provides accurate, curriculum-based answers to student questions across all subjects.

### Key Highlights

- ✅ **Curriculum-Specific**: Trained exclusively on official Sudanese curriculum materials
- 🎯 **117 Subjects**: Covers all subjects from Grade 1 through Grade 12 (Science & Arts tracks)
- 🤖 **AI-Powered**: Uses Google Gemini 2.5 Flash with RAG (Retrieval-Augmented Generation)
- 🌐 **Bilingual**: Supports both Arabic and English
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🔒 **Source-Grounded**: Every answer includes citations from curriculum documents

---

## ✨ Features

### For Students
- 📚 Select your grade and subject
- 💬 Ask questions in natural language (Arabic or English)
- 📖 Get accurate answers based solely on the curriculum
- 🔍 View source citations and references
- 💡 Receive encouragement and learning support

### For Educators & Administrators
- 🎓 Monitor curriculum coverage
- 📊 Understand common student questions
- 🔄 Easy curriculum updates via File Search Store
- 🌍 Accessible from anywhere with internet

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sudatutor-v6.git
   cd sudatutor-v6
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit .env.local and add your API key
   # GEMINI_API_KEY=your-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📂 Project Structure

```
sudatutor-v6/
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── ChatInterface.tsx    # Main chat UI
│   │   ├── SelectionScreen.tsx  # Grade/subject selection
│   │   ├── Spinner.tsx          # Loading indicator
│   │   └── icons/               # SVG icon components
│   ├── services/                # Business logic
│   │   └── geminiService.ts     # Gemini AI integration
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Application entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── curriculumData.ts        # Grade/subject mappings
│   └── index.css                # Global styles
├── config/                      # Configuration files
│   └── app.config.ts           # Application constants
├── scripts/                     # Utility scripts
│   ├── create-filestore.js     # Create File Search Store
│   ├── upload-curriculum.js    # Upload curriculum files
│   ├── check-store.js          # Verify store status
│   └── cleanup-rag-stores.js   # Cleanup old stores
├── curriculum-data/             # Curriculum text files (117 files)
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### Application Config

Edit `config/app.config.ts` to customize:

```typescript
export const CONFIG = {
  FILE_SEARCH_STORE_NAME: 'fileSearchStores/your-store-id',
  GEMINI_MODEL: 'gemini-2.5-flash',
  // ... more options
};
```

---

## 📚 Documentation

### File Search Store Setup

The application uses Google's File Search Store to manage curriculum documents. Follow these steps:

#### 1. Create File Search Store

```bash
# Set your API key
export GEMINI_API_KEY="your-api-key-here"  # Linux/Mac
$env:GEMINI_API_KEY="your-api-key-here"    # Windows PowerShell

# Create the store
node scripts/create-filestore.js
```

#### 2. Upload Curriculum Files

```bash
# Upload all 117 curriculum files
node scripts/upload-curriculum.js
```

This will upload all files from `curriculum-data/` to your File Search Store.

#### 3. Verify Upload

```bash
# Check store status
node scripts/check-store.js

# List all documents
node scripts/upload-curriculum.js --list
```

#### 4. Update Configuration

Copy the store name from the creation output and update `config/app.config.ts`:

```typescript
FILE_SEARCH_STORE_NAME: 'fileSearchStores/your-new-store-id'
```

---

## 🎨 Customization

### Adding New Subjects

1. Add curriculum file to `curriculum-data/`
2. Update `src/curriculumData.ts`
3. Re-upload to File Search Store

### Changing UI Theme

Edit Tailwind configuration in `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'gem-blue': '#4A90E2',  // Primary color
        // ... customize more colors
      }
    }
  }
}
```

### Modifying System Instructions

Edit the prompt in `src/services/geminiService.ts`:

```typescript
systemInstruction: `Your custom instructions here...`
```

---

## 🏗️ Build for Production

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

#### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

**Environment Variables**: Configure `GEMINI_API_KEY` in your hosting provider's dashboard.

#### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

Build and run:

```bash
docker build -t sudatutor .
docker run -p 3000:3000 -e GEMINI_API_KEY=your-key sudatutor
```

#### Option 3: Traditional Server

1. Build the project: `npm run build`
2. Copy `dist/` folder to your server
3. Serve with nginx, Apache, or similar

---

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Technology Stack

- **Frontend**: React 19.2.0, TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS, Custom CSS
- **Font**: Cairo (Google Fonts)

---

## 📊 Curriculum Coverage

### Grades 1-9
- Arabic, English, Math, Islamic Studies
- Science, IT, History, Geography
- Art, Nature, Technical Education

### Grades 10-12
- **Science Track**: Physics, Chemistry, Biology, Engineering
- **Arts Track**: History, Geography, Literature
- **Common**: Arabic, English, Islamic Studies, IT

**Total**: 117 curriculum documents covering 12 grade levels

---

## 🔒 Security & Privacy

- ✅ API keys stored in environment variables
- ✅ No user data stored on servers
- ✅ All queries processed through Google's secure infrastructure
- ✅ No tracking or analytics by default

**Note**: This is a client-side application. The API key is exposed in the browser. For production use with public access, implement a backend proxy to secure the API key.

---

## 🐛 Troubleshooting

### Issue: "API_KEY environment variable not set"

**Solution**: Ensure `.env.local` exists with `GEMINI_API_KEY=your-key`

### Issue: "File Search Store not found"

**Solution**: 
1. Run `node scripts/create-filestore.js`
2. Update `config/app.config.ts` with the new store name

### Issue: "No curriculum documents found"

**Solution**: Run `node scripts/upload-curriculum.js` to upload curriculum files

### Issue: Build errors

**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **National Centre for Curricula and Educational Research (NCCER)** - Sudanese curriculum content
- **Google Gemini** - AI capabilities
- **Google AI Studio** - File Search functionality
- **React** - UI framework
- **Vite** - Build tool

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sudatutor-v6/issues)
- **Documentation**: See `CORPUS_SETUP.md` for detailed setup instructions

---

## 🗺️ Roadmap

- [ ] Add user authentication
- [ ] Implement progress tracking
- [ ] Add quiz generation
- [ ] Support voice input
- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Multi-language support beyond Arabic/English

---

<div align="center">

**Made with ❤️ for Sudanese students**

[⬆ Back to Top](#المعلم-السوداني-sudanese-teacher)

</div>

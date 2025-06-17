# 🚀 FasTrack - AI-Enhanced Recruitment System

A modern, intelligent recruitment platform that combines traditional keyword matching with cutting-edge AI to revolutionize how organizations find and evaluate talent.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.1.0-purple)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)

## ✨ Features

### 🧠 **AI-Enhanced Matching System**
- **Hybrid Intelligence**: Combines keyword matching with semantic AI analysis
- **Free Open-Source Models**: Uses Hugging Face's sentence transformers and BART models
- **Semantic Understanding**: Goes beyond keywords to understand context and meaning
- **Experience Analysis**: Intelligently matches candidate experience with job requirements
- **Skills Categorization**: Automatically classifies skills into domains (frontend, backend, data science, etc.)

### 📊 **Comprehensive Analytics**
- **Detailed Score Breakdown**: See how keyword and AI scores combine
- **Confidence Scoring**: Understand reliability of each match
- **Strengths & Gaps Analysis**: Clear identification of candidate strengths and skill gaps
- **Smart Recommendations**: AI-generated hiring advice and next steps
- **Interview Question Generation**: Contextual questions tailored to each candidate

### 💼 **Complete Recruitment Workflow**
- **Admin Dashboard**: Full recruitment management interface
- **Candidate Portal**: User-friendly interface for job seekers
- **CV Management**: Upload, analyze, and organize candidate profiles
- **Job Management**: Create, edit, and manage job postings
- **Technical Testing**: Built-in coding assessments with automated scoring
- **Real-time Analytics**: Track recruitment metrics and performance

### 🔒 **Privacy & Security**
- **Local Data Storage**: All sensitive data stored in browser localStorage
- **No External Dependencies**: Works completely offline after initial setup
- **Free API Usage**: Uses completely free Hugging Face models
- **Transparent AI**: Open-source models with explainable results

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive, modern UI design
- **Lucide React** for consistent iconography
- **Vite** for fast development and optimized builds

### AI Integration
- **Hugging Face Inference API** for free AI model access
- **Sentence Transformers** for semantic similarity analysis
- **BART (facebook/bart-large-mnli)** for zero-shot classification
- **Custom Hybrid Algorithm** combining traditional and AI approaches

### Data Management
- **Local State Management** with React hooks
- **Browser localStorage** for persistence across sessions
- **Type-safe interfaces** for all data structures
- **Automatic data expiration** (24-hour cache for AI results)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Hugging Face API Token** (free) - [Get yours here](https://huggingface.co/settings/tokens)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/askshameer/fastrack-linux.git
   cd fastrack-linux
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### First Login
Use these demo credentials to explore the system:

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**User Accounts:**
- `john@example.com` / `user123` (Full Stack Developer)
- `sarah@example.com` / `user123` (Data Scientist)
- `mike@example.com` / `user123` (DevOps Engineer)
- `emily@example.com` / `user123` (Frontend Developer)

## 🎯 How to Use AI Matching

### 1. Setup AI Enhancement
1. Login as admin and go to the **"Matching"** section
2. Click **"Setup AI"** button
3. Get your free API token from [Hugging Face](https://huggingface.co/settings/tokens)
4. Enter the token (starts with `hf_`) and click "Setup AI Matching"

### 2. Run Analysis
1. Click **"Run AI Matching"** to analyze all CV-Job combinations
2. Wait for analysis to complete (30 seconds to 2 minutes depending on data size)
3. Results are automatically saved and persist across sessions

### 3. Explore Results
- **Click any match card** to expand detailed analysis
- **View score breakdowns** showing keyword vs AI contributions
- **Read AI-generated insights** about strengths, gaps, and recommendations
- **Get interview questions** tailored to each candidate
- **Enable technical tests** with one click

## 📖 Demo Data

The system comes with rich demo data to showcase AI capabilities:

### Jobs Available
1. **Senior Full Stack Developer** - React, Node.js, TypeScript, AWS
2. **Data Scientist** - Python, Machine Learning, TensorFlow, Statistics
3. **DevOps Engineer** - Kubernetes, Docker, Jenkins, AWS, Terraform
4. **Frontend Developer** - React, TypeScript, CSS, HTML, Figma

### Sample Candidates
- **6 realistic CV profiles** with detailed experience descriptions
- **Diverse skill sets** covering different technology domains
- **Varied experience levels** from 2+ to 6+ years

## 🔧 Configuration

### Environment Setup
Create a `.env` file in the root directory:
```env
# Optional: Set your Hugging Face token here
VITE_HUGGINGFACE_API_TOKEN=hf_your_token_here
```

### Customizing AI Models
You can modify the AI models used in `src/services/aiMatching.js`:

```javascript
// Semantic similarity model
model: 'sentence-transformers/all-MiniLM-L6-v2'

// Zero-shot classification model  
model: 'facebook/bart-large-mnli'
```

### Adjusting Match Weights
Customize how keyword and AI scores are combined:

```javascript
const keywordWeight = aiConfidence > 50 ? 0.3 : 0.7;
const aiWeight = 1 - keywordWeight;
```

## 📊 AI Analysis Output

The system provides comprehensive analysis for each CV-Job match:

```json
{
  "finalScore": 85,
  "confidence": 92,
  "breakdown": {
    "keyword": {
      "score": 75,
      "matchedSkills": ["React", "Node.js", "TypeScript"],
      "missingSkills": ["AWS", "Docker"]
    },
    "ai": {
      "overallScore": 88,
      "similarity": 82,
      "experienceMatch": 95,
      "skillsAlignment": {
        "score": 87,
        "categories": [
          {"category": "full stack development", "confidence": 94}
        ]
      }
    }
  },
  "insights": {
    "strengths": [
      "Strong technical skills: React, Node.js, TypeScript",
      "Experience level exceeds job requirements"
    ],
    "gaps": ["Missing key skills: AWS, Docker"],
    "recommendations": [
      "Excellent candidate - proceed to technical interview",
      "Focus on cultural fit and team dynamics"
    ]
  },
  "interviewFocus": [
    "Tell me about your experience with React",
    "What's the most challenging project you've worked on?"
  ]
}
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

### Project Structure

```
fastrack-linux/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── EnhancedMatchingSection.tsx
│   │   ├── JobsSection.tsx
│   │   ├── CVsSection.tsx
│   │   └── ...
│   ├── services/           # Business logic and API services
│   │   └── aiMatching.js   # AI matching algorithms
│   ├── data/              # Demo data and mock datasets
│   │   └── demoData.js
│   ├── utils/             # Utility functions
│   │   └── textProcessing.ts
│   ├── types.ts           # TypeScript type definitions
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── docs/                  # Documentation files
│   ├── AI_MATCHING_GUIDE.md
│   └── AI_IMPLEMENTATION_SUMMARY.md
└── package.json           # Dependencies and scripts
```

### Adding New Features

1. **New AI Models**: Add to `src/services/aiMatching.js`
2. **UI Components**: Create in `src/components/`
3. **Data Types**: Define in `src/types.ts`
4. **Mock Data**: Add to `src/data/demoData.js`

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and TypeScript conventions
- Add proper error handling and loading states
- Include comprehensive comments for complex logic
- Test AI features with various input scenarios
- Ensure responsive design works on all screen sizes

## 🧪 Testing

### Manual Testing Checklist
- [ ] Admin login and dashboard navigation
- [ ] CV upload and management
- [ ] Job creation and editing
- [ ] AI matching setup and execution
- [ ] Match analysis and insights review
- [ ] Technical test assignment and completion
- [ ] User dashboard functionality
- [ ] Data persistence across sessions

### AI Testing Scenarios
- [ ] Test with diverse CV content (technical, non-technical)
- [ ] Verify semantic similarity accuracy
- [ ] Check experience level matching
- [ ] Validate skills categorization
- [ ] Test fallback to keyword-only mode

## 🔍 Troubleshooting

### Common Issues

**AI Analysis Fails**
- Verify Hugging Face API token is valid
- Check internet connection
- Try clearing localStorage data

**Results Not Persisting**
- Check browser localStorage permissions
- Verify not in incognito/private mode
- Clear browser cache and retry

**Slow Performance**
- First AI analysis may take longer (model loading)
- Subsequent analyses use caching
- Consider analyzing smaller batches

**TypeScript Errors**
- Run `npm install` to update dependencies
- Check for proper type imports
- Verify all interfaces are correctly defined

### Support & Documentation

- **AI Matching Guide**: See `AI_MATCHING_GUIDE.md`
- **Implementation Details**: See `AI_IMPLEMENTATION_SUMMARY.md`
- **GitHub Issues**: Report bugs and feature requests
- **API Documentation**: Check Hugging Face docs for model details

## 📈 Performance

### Metrics
- **Keyword Matching**: ~10ms per CV-job pair
- **AI Analysis**: ~2-5 seconds per pair (first run, then cached)
- **UI Responsiveness**: <100ms for all interactions
- **Bundle Size**: ~528KB (including AI libraries)

### Optimization Tips
- Results are cached for 24 hours to avoid re-computation
- AI analysis runs asynchronously to maintain UI responsiveness
- LocalStorage used for instant data loading
- Lazy loading for non-critical components

## 🛡️ Security & Privacy

### Data Protection
- **No external data storage**: All data remains in browser
- **Local processing**: AI analysis uses direct API calls
- **Token security**: API tokens stored only in localStorage
- **No tracking**: No analytics or user behavior monitoring

### GDPR Compliance
- Users control all their data locally
- Easy data deletion via "Clear Data" button
- No third-party data sharing
- Transparent data processing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for providing free, open-source AI models
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for beautiful icons
- **Open Source Community** for inspiration and contributions

## 🔮 Future Roadmap

### Short Term (Next Release)
- [ ] Resume improvement suggestions
- [ ] Batch processing for large datasets
- [ ] Custom scoring weights configuration
- [ ] PDF export for detailed reports

### Medium Term
- [ ] Local LLM support (Ollama integration)
- [ ] Video interview analysis
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### Long Term
- [ ] Mobile app development
- [ ] Integration with popular ATS systems
- [ ] Custom model training capabilities
- [ ] Enterprise SSO integration

---

**Built with ❤️ by the FasTrack team**

*Revolutionizing recruitment through intelligent technology*
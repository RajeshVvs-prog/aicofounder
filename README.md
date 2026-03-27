# AI Co-Founder 🤖

**An AI-powered virtual co-founder to help solo founders and small teams generate ideas, plan MVPs, and validate concepts with actionable guidance.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Overview

AI Co-Founder acts as a smart brainstorming partner, market research assistant, and project planning guide. It's designed to help founders **build smarter, faster, and with confidence** by leveraging Google's Gemini AI.

---

## Key Features

- 💡 **Idea Generation** – Generate innovative startup or product ideas based on your inputs
- 🔍 **Deep Validation** – Analyze problem-solution fit with comprehensive scoring
- 📊 **Market Research** – Conduct competitor analysis and explore market trends
- 🛠 **MVP Planning** – Get a 7-day execution roadmap with AI tools and strategies
- 🚀 **Actionable Guidance** – Structured, actionable advice to accelerate product development

---

## Who It's For

- Solo founders looking to validate ideas quickly
- Early-stage entrepreneurs exploring market opportunities
- Small teams wanting to accelerate idea validation and MVP development
- Students and aspiring entrepreneurs learning startup fundamentals

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.1
- **AI**: Google Gemini 1.5 Pro
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-co-founder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
ai-co-founder/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── validate/
│   │           └── route.ts          # API endpoint for idea validation
│   ├── lib/
│   │   └── validation.ts             # Input validation utilities
│   ├── services/
│   │   ├── geminiService.ts          # AI service integration
│   │   └── types.ts                  # TypeScript type definitions
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # Application entry point
│   ├── types.ts                      # Global type definitions
│   └── index.css                     # Global styles
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # This file
```

---

## Features in Detail

### 1. Idea Generation
- Input your field, problem type, and target users
- Get 3 tailored startup ideas with feasibility scores
- Each idea includes target audience, unique value, and emoji markers

### 2. Deep Validation
- Comprehensive 9-point analysis framework
- Scores for problem clarity, market opportunity, feasibility, and more
- Final verdict and co-founder opinion
- Actionable improvement suggestions

### 3. Market Research
- Market overview with size and growth analysis
- Target audience segmentation
- Competitor landscape mapping
- Opportunities and risks identification
- Go-to-market strategy recommendations

### 4. Execution Plan
- 7-day MVP development roadmap
- AI-first approach with minimal coding
- Daily objectives, tools, and deliverables
- Best practices and tips for each phase

---

## Security & Best Practices

✅ **Implemented**:
- Environment variables for API keys
- Input validation and sanitization
- Error boundaries for graceful error handling
- TypeScript for type safety
- Proper .gitignore configuration

🔒 **Security Notes**:
- Never commit `.env` files
- API keys are server-side only
- Input is validated and sanitized
- Error messages don't expose sensitive data

---

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run TypeScript type checking
npm run clean    # Clean build artifacts
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Troubleshooting

### API Key Issues
- Ensure your `.env` file exists and contains `GEMINI_API_KEY`
- Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/)
- Restart the development server after adding the API key

### Build Errors
- Run `npm run lint` to check for TypeScript errors
- Ensure all dependencies are installed: `npm install`
- Clear cache and rebuild: `npm run clean && npm run build`

### Rate Limiting
- Gemini API has rate limits - wait a few seconds between requests
- Consider implementing request queuing for production use

---

## Roadmap

- [ ] Add user authentication
- [ ] Implement idea history and favorites
- [ ] Add export functionality (PDF reports)
- [ ] Integrate more AI models for comparison
- [ ] Add collaborative features for teams
- [ ] Implement rate limiting and caching
- [ ] Add comprehensive test suite

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- UI inspired by Y Combinator's design language
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the maintainers

---

**Made with ❤️ for founders, by founders**

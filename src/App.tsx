import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import Markdown from "react-markdown";
import { 
  Rocket, Lightbulb, Search, ClipboardList, Loader2, Sparkles, 
  ArrowRight, ChevronRight, Users, Zap, 
  TrendingUp, ShieldCheck, Calendar, MessageSquare,
  Globe, Layout, Code, Star, X, Linkedin, Mail, Info, Phone, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- ERROR HANDLING ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pale p-6">
          <div className="bg-white p-12 rounded-[32px] shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldCheck size={40} />
            </div>
            <h2 className="font-serif text-3xl font-black text-ink mb-4">Something went wrong</h2>
            <p className="text-warm-gray mb-8">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-yc text-white font-bold rounded-xl hover:bg-yc-dark transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- AI INSTRUCTIONS ---

const IDEA_GEN_INSTRUCTION = `You are an idea generation expert. Generate 3 distinct startup/business/product ideas based on the user's input. 
Deliver the output in a clean, readable, and slide-ready format.

Input:
{{field}}, {{problemType}}, {{targetUsers}}

For each idea, provide:
- Title of Idea
- Short Description: What the idea is, what problem it solves, and how it works.
- Target Audience: Who will use this idea.
- Unique Value / Differentiator: Why it is special.
- Feasibility / Potential Score (0–100): Likelihood of success or impact.
- Emoji / Visual Marker: To make it appealing.

Guidelines:
- Ideas should be practical, innovative, and actionable.
- Keep text concise, readable, and professional.
- Provide a balanced mix of novelty and feasibility.

Return output in this exact JSON format:
{
  "ideas": [
    {
      "title": "...",
      "description": "...",
      "target_audience": "...",
      "unique_value": "...",
      "score": number,
      "emoji": "..."
    }
  ]
}`;

const VALIDATION_INSTRUCTION = `You are an expert startup co-founder, product strategist, and investor.
Your task is to deeply analyze a startup idea and provide a thorough, structured evaluation as if you are deciding whether to invest time and money into it.
Do NOT give generic or surface-level answers. Think critically, deeply, and realistically.
Be honest and slightly critical, not overly positive. No sugar coating.

Startup Idea:
{{idea}}

Provide your response in the following sections:
1. Problem Clarity (Score /10): What exact problem is being solved? Is this a real and meaningful problem? Who experiences this problem most? Justify the score.
2. Target Users & Need Strength (Score /10): Who are the primary users? How badly do they need this solution? Is this a must-have or nice-to-have? Reasoning for the score.
3. Market Opportunity (Score /10): Is this a growing, stable, or declining space? Approximate scale (avoid exact numbers, use terms like “large market”, “niche”, etc.). Justify the score.
4. Competitive Landscape (Score /10): Mention 2–3 existing solutions naturally. How strong are they? What makes this idea different? Reasoning for the score.
5. Unique Value Proposition (Score /10): What makes this idea stand out? Is there a clear differentiation? Reasoning for the score.
6. Feasibility & Execution (Score /10): Can this realistically be built by a small team or student? Technical complexity level. Time to MVP. Reasoning for the score.
7. Monetization Potential (Score /10): How can this make money? Is revenue model clear or unclear? Reasoning for the score.
8. Risks & Challenges (Score /10): Biggest risks (technical, market, adoption). What could go wrong? Reasoning for the score.
9. Improvement Suggestions: 2–3 specific ways to improve the idea significantly.

Final Evaluation:
Total Score: /100
One-line verdict: (Strong idea / Needs improvement / Weak idea)
Final Co-Founder Opinion: Give a clear, honest recommendation: Would you build this or not? Why?

Guidelines:
- Be deep and realistic, not generic.
- Avoid fake precise numbers.
- Write content in a human, insightful tone.
- Keep each section concise but meaningful.
- Depth is more important than length.

Return output in this exact JSON format:
{
"slides": [
{
"title": "Problem Clarity",
"score": number (out of 10),
"content": "..."
},
{
"title": "Target Users & Need",
"score": number,
"content": "..."
},
{
"title": "Market Opportunity",
"score": number,
"content": "..."
},
{
"title": "Competitive Landscape",
"score": number,
"content": "..."
},
{
"title": "Unique Value Proposition",
"score": number,
"content": "..."
},
{
"title": "Feasibility & Execution",
"score": number,
"content": "..."
},
{
"title": "Monetization Potential",
"score": number,
"content": "..."
},
{
"title": "Risks & Challenges",
"score": number,
"content": "..."
},
{
"title": "Improvements",
"score": 0,
"content": "..."
}
],
"final_score": number (sum out of 100),
"verdict": "Strong idea / Needs improvement / Weak idea",
"final_opinion": "..."
}`;

const MARKET_RESEARCH_INSTRUCTION = `You are a market research expert. Conduct a deep, structured market research report for the following product/market. 
Deliver the analysis as structured data for interactive cards.

Startup Idea:
{{idea}}

Sections to include:
1. Market Overview: Description, Size & Growth, Trends, Score (0–100).
2. Target Audience Analysis: Customer Segments, Pain Points, Willingness to Pay, Score (0–100).
3. Competitor Analysis: Direct Competitors, Indirect Competitors, Market Positioning, Score (0–100).
4. Market Opportunities: Gaps, Trends to Leverage, Score (0–100).
5. Market Risks & Barriers: Challenges, Threats, Score (0–100).
6. Go-to-Market Insights: Channels, Pricing Strategy, Marketing Hooks, Score (0–100).
7. Overall Market Score: Aggregate score (0–100), Actionable Recommendation.

Guidelines:
- Write in professional, readable, slide-ready style.
- Use bullet points for key points.
- Include emojis for clarity and engagement.
- Be deep and realistic.

Return output in this exact JSON format:
{
  "cards": [
    {
      "title": "Market Overview",
      "points": ["...", "..."],
      "score": number
    },
    {
      "title": "Target Audience Analysis",
      "points": ["...", "..."],
      "score": number
    },
    {
      "title": "Competitor Analysis",
      "points": ["...", "..."],
      "score": number
    },
    {
      "title": "Market Opportunities",
      "points": ["...", "..."],
      "score": number
    },
    {
      "title": "Market Risks & Barriers",
      "points": ["...", "..."],
      "score": number
    },
    {
      "title": "Go-to-Market Insights",
      "points": ["...", "..."],
      "score": number
    }
  ],
  "overall_score": number,
  "recommendation": "..."
}`;

const EXECUTION_PLAN_INSTRUCTION = `You are an MVP building expert. Generate a 7-day MVP development plan for building a startup/product using AI tools primarily and minimal coding.
Deliver the analysis as structured data for interactive cards, one for each day.

Startup Idea:
{{idea}}

For each day (Card 1 to Card 7), include:
- Day Title / Number
- Objective: What to achieve that day
- Tools & Resources: AI tools, software, or minimal coding solutions to use
- Deliverables / Output: Tangible result for that day
- Tips / Notes: Best practices, focus areas, or cautions

Guidelines:
- Highlight AI-first approach with minimal coding.
- Make the text concise, professional, and readable.
- Use bullet points for clarity.

Return output in this exact JSON format:
{
  "days": [
    {
      "day": 1,
      "title": "Ideation & Validation",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 2,
      "title": "Market & Competitor Research",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 3,
      "title": "Feature Prioritization & MVP Scope",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 4,
      "title": "UI/UX Design",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 5,
      "title": "AI Implementation / Low-Code Build",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 6,
      "title": "Testing & Feedback",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    },
    {
      "day": 7,
      "title": "Refinement & Launch Prep",
      "objective": "...",
      "tools": ["...", "..."],
      "deliverables": ["...", "..."],
      "tips": "..."
    }
  ]
}`;

// --- TYPES ---

type AnalysisStep = "validation" | "market" | "execution" | null;

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-border flex justify-between items-center bg-pale">
          <h3 className="font-serif text-2xl font-black text-ink">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-warm-gray hover:text-yc hover:border-yc transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Marquee = () => (
  <div className="bg-ink py-4 overflow-hidden border-y border-[rgba(255,102,0,0.2)]">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-12 px-6">
          <span className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2">
            <Sparkles size={14} /> Idea Validation
          </span>
          <span className="text-white/20 font-mono text-[11px] font-bold tracking-[2px] uppercase">Market Research</span>
          <span className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2">
            <Rocket size={14} /> Execution Plan
          </span>
          <span className="text-white/20 font-mono text-[11px] font-bold tracking-[2px] uppercase">Growth Strategy</span>
        </div>
      ))}
    </div>
  </div>
);

const PillarCard = ({ num, title, desc, icon: Icon, delay }: { num: string, title: string, desc: string, icon: any, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="pillar-card group"
  >
    <div className="pillar-num">{num}</div>
    <div className="w-12 h-12 bg-yc-light rounded-lg flex items-center justify-center text-yc mb-6 group-hover:bg-yc group-hover:text-white transition-all duration-300">
      <Icon size={24} />
    </div>
    <h3 className="font-serif text-2xl font-bold text-ink mb-4">{title}</h3>
    <p className="text-warm-gray text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Testimonial = ({ quote, author, role, avatar }: { quote: string, author: string, role: string, avatar: string }) => (
  <div className="bg-white p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yc text-yc" />)}
    </div>
    <p className="text-ink font-medium italic mb-6 leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-3">
      <img src={avatar} alt={author} className="w-10 h-10 rounded-full bg-yc-light" referrerPolicy="no-referrer" />
      <div>
        <h4 className="text-sm font-bold text-ink">{author}</h4>
        <p className="text-[11px] text-warm-gray font-semibold uppercase tracking-wider">{role}</p>
      </div>
    </div>
  </div>
);

// --- MAIN APP ---

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTool, setActiveTool] = useState<"generate" | "validate" | "market" | "execution" | null>(null);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  
  // Custom Cursor
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Idea Generation State
  const [genFields, setGenFields] = useState({
    field: "",
    problemType: "",
    targetUsers: ""
  });
  const [generatedIdeas, setGeneratedIdeas] = useState<any>(null);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAnalyze = async (step: "validate" | "market" | "execution") => {
    if (!idea.trim() || !step) return;

    setLoading(true);

    const endpoints = {
      validate: "/api/validate",
      market: "/api/market",
      execution: "/api/execution"
    };

    try {
      const response = await fetch(endpoints[step], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      const json = await response.json();
      setResults(prev => ({ ...prev, [step]: json }));
    } catch (error) {
      console.error(`Error generating ${step} analysis:`, error);
      setResults(prev => ({ ...prev, [step]: "Sorry, something went wrong. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFields.field || !genFields.problemType || !genFields.targetUsers) return;

    setLoading(true);
    setGeneratedIdeas(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: genFields.field,
          problemType: genFields.problemType,
          targetUsers: genFields.targetUsers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      const json = await response.json();
      setGeneratedIdeas(json);
    } catch (error) {
      console.error("Error generating ideas:", error);
      setGeneratedIdeas("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setIdea("");
    setResults({});
    setGeneratedIdeas(null);
    setGenFields({ field: "", problemType: "", targetUsers: "" });
  };

  return (
    <div className="min-h-screen bg-pale selection:bg-yc-mid selection:text-yc-dark">
      {/* Custom Cursor */}
      <div 
        id="cursor" 
        style={{ left: mousePos.x, top: mousePos.y, transform: `translate(-50%, -50%) scale(${isHovering ? 2.5 : 1})` }} 
      />
      <div 
        id="cursor-ring" 
        style={{ left: mousePos.x, top: mousePos.y, transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})` }} 
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="nav-logo cursor-pointer" 
              onClick={() => { setHasStarted(false); setActiveTool(null); reset(); }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="w-8 h-8 bg-yc rounded-lg flex items-center justify-center text-white">
                <Rocket size={18} />
              </div>
              <span>AI CO-FOUNDER</span>
              <span className="nav-logo-badge">BETA</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { 
                setHasStarted(true); 
                document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth" }); 
              }}
              className="btn-sm-yc"
            >
              Start Building
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-kicker">
              <div className="kicker-dot" />
              <span>Powered by Gemini 3.1 Pro</span>
            </div>
            <h1 className="hero-h1 mb-8">
              Validate your <span className="text-yc italic">startup idea</span> in seconds.
            </h1>
            <p className="text-warm-gray text-xl mb-10 leading-relaxed max-w-xl">
              Stop guessing. Get deep-dive validation, market research, and a 7-day execution roadmap for your vision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                className="btn-hero"
                onClick={() => { 
                  setHasStarted(true); 
                  setTimeout(() => document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth" }), 100); 
                }}
              >
                Get Started <ArrowRight size={18} />
              </button>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img 
                      key={i} 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-yc-light" 
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="text-xs font-bold text-ink tracking-tight">
                  <span className="text-yc">500+</span> founders validated this week
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="hero-card relative z-10">
              <div className="hcard-header">
                <div className="hcard-dot bg-[#FF5F56]" />
                <div className="hcard-dot bg-[#FFBD2E]" />
                <div className="hcard-dot bg-[#27C93F]" />
                <span className="text-[10px] font-mono text-white/40 ml-2">validation_report.pdf</span>
              </div>
              <div className="hcard-body">
                <div className="hcard-label">Startup Idea</div>
                <div className="hcard-idea">"A platform for students to rent high-end textbooks for a fraction of the cost."</div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink mb-2">
                      <span>Market Demand</span>
                      <span className="text-yc">88%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="score-bar-wrap"><div className="score-bar w-[88%]" /></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink mb-2">
                      <span>Execution Ease</span>
                      <span className="text-yc">92%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="score-bar-wrap"><div className="score-bar w-[92%]" /></div>
                    </div>
                  </div>
                </div>

                <div className="hcard-verdict">
                  <div className="text-[10px] font-bold text-yc uppercase tracking-wider mb-1">AI Verdict</div>
                  <p className="text-[12px] text-ink font-medium leading-relaxed">
                    High potential. Focus on university campus partnerships and a peer-to-peer logistics model to minimize overhead.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yc/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-yc/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* Tool Section */}
      <AnimatePresence>
        {hasStarted && (
          <motion.section 
            id="tool-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="py-24 px-6 bg-white border-b border-border"
          >
            <div className="max-w-7xl mx-auto">
              {!activeTool ? (
                <div className="space-y-16">
                  <div className="text-center">
                    <h2 className="font-serif text-4xl font-bold text-ink mb-4">Choose Your Path</h2>
                    <p className="text-warm-gray">Select one of our core pillars to begin your journey.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { id: "generate", title: "Idea Generation", desc: "Brainstorm tailored startup concepts.", icon: Lightbulb, delay: 0.1 },
                      { id: "validate", title: "Deep Validation", desc: "Analyze problem-solution fit.", icon: ShieldCheck, delay: 0.2 },
                      { id: "market", title: "Market Intel", desc: "Research competitors and demand.", icon: TrendingUp, delay: 0.3 },
                      { id: "execution", title: "Execution Plan", desc: "Get a 7-day build roadmap.", icon: Zap, delay: 0.4 },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTool(tool.id as any);
                        }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className="pillar-card group text-left w-full"
                      >
                        <div className="pillar-num">{tool.id === "generate" ? "01" : tool.id === "validate" ? "02" : tool.id === "market" ? "03" : "04"}</div>
                        <div className="w-12 h-12 bg-yc-light rounded-lg flex items-center justify-center text-yc mb-6 group-hover:bg-yc group-hover:text-white transition-all duration-300">
                          <tool.icon size={24} />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-ink mb-4">{tool.title}</h3>
                        <p className="text-warm-gray text-sm leading-relaxed mb-6">{tool.desc}</p>
                        <div className="flex items-center gap-2 text-yc font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                          Select Tool <ArrowRight size={14} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <button 
                    onClick={() => { setActiveTool(null); reset(); }}
                    className="flex items-center gap-2 text-warm-gray hover:text-yc font-bold text-xs uppercase tracking-widest mb-12 transition-all"
                  >
                    <ArrowRight size={14} className="rotate-180" /> Back to Options
                  </button>

                  {activeTool === "generate" ? (
                    <div className="space-y-12">
                      <div className="text-center">
                        <h2 className="font-serif text-4xl font-bold text-ink mb-4">Get Startup Ideas</h2>
                        <p className="text-warm-gray">Tell us what you're interested in, and we'll handle the brainstorming.</p>
                      </div>

                      <form onSubmit={handleGenerateIdeas} className="bg-white border border-border rounded-[32px] p-12 shadow-sm space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-warm-gray uppercase tracking-widest">Field</label>
                            <input 
                              type="text"
                              placeholder="e.g., Education"
                              value={genFields.field}
                              onChange={(e) => setGenFields(prev => ({ ...prev, field: e.target.value }))}
                              className="w-full p-4 bg-surface border border-border rounded-xl focus:bg-white focus:border-yc outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-warm-gray uppercase tracking-widest">Problem</label>
                            <input 
                              type="text"
                              placeholder="e.g., Inefficiency"
                              value={genFields.problemType}
                              onChange={(e) => setGenFields(prev => ({ ...prev, problemType: e.target.value }))}
                              className="w-full p-4 bg-surface border border-border rounded-xl focus:bg-white focus:border-yc outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-warm-gray uppercase tracking-widest">Users</label>
                            <input 
                              type="text"
                              placeholder="e.g., Students"
                              value={genFields.targetUsers}
                              onChange={(e) => setGenFields(prev => ({ ...prev, targetUsers: e.target.value }))}
                              className="w-full p-4 bg-surface border border-border rounded-xl focus:bg-white focus:border-yc outline-none transition-all font-medium"
                            />
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={loading || !genFields.field || !genFields.problemType || !genFields.targetUsers}
                          className="w-full bg-yc hover:bg-yc-dark disabled:bg-border text-white py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-yc/20"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                          {loading ? "Generating Ideas..." : "Generate 3 Startup Ideas"}
                        </button>
                      </form>

                      {generatedIdeas && typeof generatedIdeas === "object" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {generatedIdeas.ideas?.map((ideaObj: any, idx: number) => (
                              <div key={idx} className="result-card group">
                                <div className="card-num group-hover:rotate-0">{idx + 1}</div>
                                <div className="text-4xl mb-6 pt-2">{ideaObj.emoji}</div>
                                <h3 className="font-serif text-2xl font-black text-ink mb-4 leading-tight">{ideaObj.title}</h3>
                                <p className="text-sm text-warm-gray leading-relaxed mb-6 font-medium">{ideaObj.description}</p>
                                
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                  <div className="p-4 bg-pale rounded-2xl border border-border/50">
                                    <div className="text-[10px] font-black text-yc uppercase tracking-[2px] mb-1">Target Audience</div>
                                    <p className="text-xs text-ink font-bold leading-tight">{ideaObj.target_audience}</p>
                                  </div>
                                  <div className="p-4 bg-pale rounded-2xl border border-border/50">
                                    <div className="text-[10px] font-black text-yc uppercase tracking-[2px] mb-1">Unique Value</div>
                                    <p className="text-xs text-ink font-bold leading-tight">{ideaObj.unique_value}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                  <div className="score-badge">
                                    <span>{ideaObj.score}%</span>
                                    <div className="w-8 h-1 bg-yc/20 rounded-full overflow-hidden">
                                      <div className="h-full bg-yc" style={{ width: `${ideaObj.score}%` }} />
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setIdea(ideaObj.title + ": " + ideaObj.description);
                                      setActiveTool("validate");
                                      setResults({});
                                      window.scrollTo({ top: document.getElementById("tool-section")?.offsetTop || 0, behavior: "smooth" });
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-yc uppercase tracking-widest hover:translate-x-1 transition-all"
                                  >
                                    Validate <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {generatedIdeas && typeof generatedIdeas === "string" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-border rounded-[32px] p-12 shadow-sm">
                          <p className="text-ink">{generatedIdeas}</p>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="text-center">
                        <h2 className="font-serif text-4xl font-bold text-ink mb-4">
                          {activeTool === "validate" ? "Validate Your Idea" : activeTool === "market" ? "Market Research" : "Execution Plan"}
                        </h2>
                        <p className="text-warm-gray">Describe your vision in detail for a high-fidelity analysis.</p>
                      </div>

                      <div className="relative group">
                        <textarea
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          placeholder="e.g., A mobile app that uses AI to help people identify edible wild plants..."
                          className="w-full min-h-[200px] p-10 bg-surface border border-border rounded-[24px] shadow-sm focus:ring-4 focus:ring-yc/5 focus:border-yc outline-none transition-all text-lg resize-none leading-relaxed font-medium"
                        />
                      </div>

                      <button
                        onClick={() => handleAnalyze(activeTool as any)}
                        disabled={loading || !idea.trim()}
                        className="w-full bg-yc hover:bg-yc-dark disabled:bg-border text-white py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-yc/20"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                        {loading ? "Analyzing..." : `Run ${activeTool === "validate" ? "Validation" : activeTool === "market" ? "Market Research" : "Execution Plan"}`}
                      </button>

                      {results[activeTool] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                          {activeTool === "validate" && typeof results[activeTool] === "object" ? (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results[activeTool].slides?.map((slide: any, idx: number) => (
                                  <div key={idx} className="result-card group">
                                    <div className="card-num group-hover:rotate-0">{idx + 1}</div>
                                    <div className="flex justify-between items-start mb-6 pt-2">
                                      <h4 className="font-serif text-xl font-black text-ink leading-tight">{slide.title}</h4>
                                      {slide.score > 0 && (
                                        <div className="score-badge">
                                          <span>{slide.score}/10</span>
                                          <div className="w-8 h-1 bg-yc/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-yc" style={{ width: `${slide.score * 10}%` }} />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-warm-gray leading-relaxed font-medium">{slide.content}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="bg-ink text-white rounded-[32px] p-10 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yc/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                    <div>
                                      <div className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase mb-2">Final Evaluation</div>
                                      <h3 className="text-4xl font-serif font-black">{results[activeTool].verdict}</h3>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-5xl font-black text-yc mb-1">{results[activeTool].final_score}<span className="text-xl text-white/40">/100</span></div>
                                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Score</div>
                                    </div>
                                  </div>
                                  <div className="h-px bg-white/10 mb-8" />
                                  <div>
                                    <div className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase mb-4">Co-Founder Opinion</div>
                                    <p className="text-lg text-white/80 leading-relaxed italic">"{results[activeTool].final_opinion}"</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : activeTool === "market" && typeof results[activeTool] === "object" ? (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results[activeTool].cards?.map((card: any, idx: number) => (
                                  <div key={idx} className="result-card group">
                                    <div className="card-num group-hover:rotate-0">{idx + 1}</div>
                                    <div className="flex justify-between items-start mb-6 pt-2">
                                      <h4 className="font-serif text-xl font-black text-ink leading-tight">{card.title}</h4>
                                      <div className="score-badge">
                                        <span>{card.score}%</span>
                                      </div>
                                    </div>
                                    <ul className="space-y-3">
                                      {card.points?.map((point: string, pIdx: number) => (
                                        <li key={pIdx} className="text-sm text-warm-gray flex gap-3 font-medium">
                                          <div className="w-1.5 h-1.5 bg-yc rounded-full mt-1.5 shrink-0" />
                                          <span>{point}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              <div className="bg-ink text-white rounded-[32px] p-10 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yc/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative z-10">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                    <div>
                                      <div className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase mb-2">Market Intel Summary</div>
                                      <h3 className="text-4xl font-serif font-black">Overall Market Potential</h3>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-5xl font-black text-yc mb-1">{results[activeTool].overall_score}<span className="text-xl text-white/40">/100</span></div>
                                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aggregate Score</div>
                                    </div>
                                  </div>
                                  <div className="h-px bg-white/10 mb-8" />
                                  <div>
                                    <div className="text-yc font-mono text-[11px] font-bold tracking-[2px] uppercase mb-4">Actionable Recommendation</div>
                                    <p className="text-lg text-white/80 leading-relaxed italic">"{results[activeTool].recommendation}"</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : activeTool === "execution" && typeof results[activeTool] === "object" ? (
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results[activeTool].days?.map((day: any, idx: number) => (
                                  <div key={idx} className="result-card flex flex-col group">
                                    <div className="card-num group-hover:rotate-0">{day.day}</div>
                                    <div className="flex justify-end mb-6">
                                      <div className="bg-yc-light text-yc font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                                        Phase {Math.ceil(day.day / 2)}
                                      </div>
                                    </div>
                                    <h4 className="font-serif text-xl font-black text-ink mb-4 leading-tight">{day.title}</h4>
                                    
                                    <div className="space-y-6 flex-grow">
                                      <div className="p-4 bg-pale rounded-2xl border border-border/50">
                                        <div className="text-[10px] font-black text-yc uppercase tracking-[2px] mb-2 flex items-center gap-2">
                                          <Zap size={10} /> Objective
                                        </div>
                                        <p className="text-xs text-ink font-bold leading-relaxed">{day.objective}</p>
                                      </div>
                                      
                                      <div>
                                        <div className="text-[10px] font-black text-warm-gray uppercase tracking-[2px] mb-3">Tools & Stack</div>
                                        <div className="flex flex-wrap gap-2">
                                          {day.tools?.map((tool: string, tIdx: number) => (
                                            <span key={tIdx} className="text-[10px] bg-white border border-border px-3 py-1 rounded-lg text-ink font-bold shadow-sm">
                                              {tool}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <div className="text-[10px] font-black text-warm-gray uppercase tracking-[2px] mb-3">Core Deliverables</div>
                                        <ul className="space-y-2">
                                          {day.deliverables?.map((del: string, dIdx: number) => (
                                            <li key={dIdx} className="text-[11px] text-warm-gray flex gap-3 font-bold items-start">
                                              <div className="w-4 h-4 bg-yc-light text-yc rounded flex items-center justify-center shrink-0 mt-0.5">
                                                <ChevronRight size={10} />
                                              </div>
                                              <span>{del}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border">
                                      <div className="text-[10px] font-bold text-yc uppercase tracking-widest mb-1">Tips / Notes</div>
                                      <p className="text-[10px] text-warm-gray italic leading-relaxed">{day.tips}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="bg-yc text-white rounded-[32px] p-10 shadow-xl relative overflow-hidden text-center">
                                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                                  <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
                                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
                                </div>
                                <div className="relative z-10">
                                  <h3 className="text-3xl font-serif font-black mb-4">Ready to Launch?</h3>
                                  <p className="text-white/80 max-w-xl mx-auto">
                                    This 7-day sprint is designed to get you from zero to a functional MVP using the power of AI and low-code tools.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-pale border border-border rounded-[32px] p-12 shadow-sm">
                              <div className="prose prose-yc max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-3xl prose-h3:text-xl prose-p:text-ink prose-p:leading-relaxed prose-li:text-ink">
                                <Markdown>{results[activeTool]}</Markdown>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Four Pillars Section */}
      <section className="py-32 px-6 bg-pale">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-[clamp(32px,4vw,56px)] font-black text-ink mb-6">The Four Pillars of Success</h2>
            <p className="text-warm-gray text-lg max-w-2xl mx-auto">We guide you through every critical stage of the early startup journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PillarCard 
              num="01"
              title="Idea Generation"
              desc="Tailored brainstorming based on your specific interests, skills, and market gaps."
              icon={Lightbulb}
              delay={0.1}
            />
            <PillarCard 
              num="02"
              title="Deep Validation"
              desc="Brutally honest analysis of problem-solution fit and early adopter profiles."
              icon={ShieldCheck}
              delay={0.2}
            />
            <PillarCard 
              num="03"
              title="Market Intel"
              desc="Data-driven research into competitors, demand scale, and untapped opportunities."
              icon={TrendingUp}
              delay={0.3}
            />
            <PillarCard 
              num="04"
              title="Execution Plan"
              desc="A concrete 7-day sprint roadmap to build and launch your first MVP."
              icon={Zap}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* 7-Day Sprint Section */}
      <section className="py-32 px-6 bg-ink text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-yc rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-yc rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3">
              <div className="inline-block bg-yc/20 text-yc font-mono text-[11px] font-bold px-4 py-2 rounded-full mb-6 tracking-[2px] uppercase">
                The Build Phase
              </div>
              <h2 className="font-serif text-5xl font-black mb-8 leading-tight">Your first week, <span className="text-yc italic">mapped out.</span></h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                We don't just give you ideas. We give you the exact steps to build them. From tech stack selection to your first 10 users.
              </p>
              <div className="space-y-6">
                {[
                  { icon: Code, text: "Modern Tech Stack Selection" },
                  { icon: Layout, text: "MVP Feature Prioritization" },
                  { icon: Users, text: "User Acquisition Strategy" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-yc group-hover:bg-yc group-hover:text-white transition-all">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { day: "01-02", title: "Core MVP Feature", desc: "Define and build the absolute minimum viable feature." },
                { day: "03-04", title: "Tech Stack & Setup", desc: "Deploy your environment and core database architecture." },
                { day: "05-06", title: "Dev Milestones", desc: "Rapid prototyping and core logic implementation." },
                { day: "07", title: "Launch & Feedback", desc: "Initial deployment and first user outreach." }
              ].map((item, i) => (
                <div key={i} className="sprint-day">
                  <div className="sprint-day-badge">DAY {item.day}</div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl font-black text-ink mb-6">How It Works</h2>
            <p className="text-warm-gray text-lg">Simple. Fast. Effective.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Input Idea", desc: "Share your vision or let us generate one for you." },
              { step: "02", title: "AI Analysis", desc: "Gemini 3.1 Pro processes market data and strategy." },
              { step: "03", title: "Get Roadmap", desc: "Receive a detailed validation and execution plan." },
              { step: "04", title: "Start Building", desc: "Follow the 7-day sprint to launch your MVP." }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-yc-light rounded-full flex items-center justify-center text-yc font-serif text-2xl font-black mx-auto mb-8 relative z-10">
                  {item.step}
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-border-strong/20" />
                )}
                <h3 className="text-lg font-bold text-ink mb-4">{item.title}</h3>
                <p className="text-warm-gray text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-pale">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl font-black text-ink mb-6">Founder Stories</h2>
            <p className="text-warm-gray text-lg">Join hundreds of builders who started here.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial 
              quote="I was stuck in analysis paralysis for months. AI Co-founder gave me the push and the plan I needed to launch my first SaaS."
              author="Sarah Chen"
              role="SaaS Founder"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
            />
            <Testimonial 
              quote="The market research was eye-opening. It helped me pivot my idea before I spent a single dollar on development."
              author="Marcus Thorne"
              role="Indie Hacker"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
            />
            <Testimonial 
              quote="The 7-day sprint is a game changer. It breaks down the overwhelming process of starting into manageable daily tasks."
              author="Elena Rodriguez"
              role="Tech Entrepreneur"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-yc rounded-[40px] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-yc/30">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10">
            <h2 className="font-serif text-5xl font-black mb-8">Ready to build your <span className="italic">empire?</span></h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
              Don't let your ideas die in a notebook. Validate, plan, and launch today with your AI Co-founder.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="nav-logo mb-6">
                <div className="w-8 h-8 bg-yc rounded-lg flex items-center justify-center text-white">
                  <Rocket size={18} />
                </div>
                <span>AI CO-FOUNDER</span>
              </div>
              <p className="text-warm-gray text-sm leading-relaxed max-w-xs mb-8">
                The ultimate companion for early-stage startup builders. From zero to MVP in 7 days.
              </p>
              <div className="flex gap-4">
                {[Globe, MessageSquare].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center text-warm-gray hover:text-yc hover:border-yc transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-warm-gray font-medium">
                <li><a href="#" className="hover:text-yc transition-colors">Idea Validator</a></li>
                <li><a href="#" className="hover:text-yc transition-colors">Market Research</a></li>
                <li><a href="#" className="hover:text-yc transition-colors">Sprint Planner</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-warm-gray font-medium">
                <li><button onClick={() => setIsAboutOpen(true)} className="hover:text-yc transition-colors">About Us</button></li>
                <li><button onClick={() => setIsContactOpen(true)} className="hover:text-yc transition-colors">Contact</button></li>
              </ul>
            </div>



            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-warm-gray font-medium">
                <li><a href="mailto:rajeshvavilapalli5@gmail.com" className="hover:text-yc transition-colors">rajeshvavilapalli5@gmail.com</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-warm-gray font-bold tracking-widest uppercase">
              © 2026 <span className="font-serif font-black italic text-yc">AI CO-FOUNDER</span>. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-warm-gray uppercase tracking-widest">System Operational</span>
              </div>
              <p className="text-[10px] font-bold text-warm-gray uppercase tracking-widest">
                Built with <Zap size={10} className="inline text-yc" /> for Founders
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isAboutOpen && (
          <Modal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} title="About Me / About Us">
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yc-light rounded-lg flex items-center justify-center text-yc">
                    <Lightbulb size={18} />
                  </div>
                  <h4 className="text-lg font-bold text-ink">Mission</h4>
                </div>
                <p className="text-warm-gray leading-relaxed">
                  I’m building technology-driven solutions to empower people, solve real-world problems, and create meaningful impact in everyday lives.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yc-light rounded-lg flex items-center justify-center text-yc">
                    <Users size={18} />
                  </div>
                  <h4 className="text-lg font-bold text-ink">Who I Am</h4>
                </div>
                <p className="text-warm-gray leading-relaxed">
                  Hi, I’m <span className="text-yc font-bold">Rajesh Vavilapalli</span>, a tech enthusiast and solo founder passionate about using AI and technology to make life simpler, smarter, and more accessible for everyone.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yc-light rounded-lg flex items-center justify-center text-yc">
                    <Star size={18} />
                  </div>
                  <h4 className="text-lg font-bold text-ink">My Values</h4>
                </div>
                <ul className="space-y-3">
                  {["Transparency & Simplicity", "Innovation with Purpose", "Human-centered Technology"].map((v, i) => (
                    <li key={i} className="flex items-center gap-3 text-warm-gray">
                      <div className="w-1.5 h-1.5 bg-yc rounded-full" />
                      {v}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yc-light rounded-lg flex items-center justify-center text-yc">
                    <Rocket size={18} />
                  </div>
                  <h4 className="text-lg font-bold text-ink">Join Me</h4>
                </div>
                <p className="text-warm-gray leading-relaxed mb-6">
                  Follow my journey as I explore, build, and learn in the world of tech and social impact.
                </p>
                <a 
                  href="https://www.linkedin.com/in/venkata-sai-rajesh-v-854148326/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  <Linkedin size={18} />
                  Connect on LinkedIn
                </a>
              </section>
            </div>
          </Modal>
        )}

        {isContactOpen && (
          <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title="Contact">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-yc-light rounded-full flex items-center justify-center text-yc mx-auto mb-8">
                <Mail size={40} />
              </div>
              <h4 className="text-xl font-bold text-ink mb-4">Get in touch</h4>
              <p className="text-warm-gray mb-8">Have a question or want to collaborate? Drop me an email.</p>
              <a 
                href="mailto:rajeshvavilapalli5@gmail.com" 
                className="text-2xl font-serif font-black text-yc hover:underline transition-all"
              >
                rajeshvavilapalli5@gmail.com
              </a>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

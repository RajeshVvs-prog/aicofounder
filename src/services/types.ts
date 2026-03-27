export interface EvaluationSlide {
  title: string;
  score: number;
  content: string;
}

export interface EvaluationResult {
  slides: EvaluationSlide[];
  final_score: number;
  verdict: string;
  final_opinion: string;
}

export interface IdeaGenerationResult {
  ideas: Array<{
    title: string;
    description: string;
    target_audience: string;
    unique_value: string;
    score: number;
    emoji: string;
  }>;
}

export interface MarketResearchResult {
  cards: Array<{
    title: string;
    points: string[];
    score: number;
  }>;
  overall_score: number;
  recommendation: string;
}

export interface ExecutionPlanResult {
  days: Array<{
    day: number;
    title: string;
    objective: string;
    tools: string[];
    deliverables: string[];
    tips: string;
  }>;
}

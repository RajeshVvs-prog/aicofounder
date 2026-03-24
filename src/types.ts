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

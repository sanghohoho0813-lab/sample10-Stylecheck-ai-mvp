export type OccasionId =
  | "wedding"
  | "interview"
  | "first-day"
  | "blind-date"
  | "family-meeting"
  | "business"
  | "date"
  | "friends"
  | "restaurant"
  | "travel"
  | "party"
  | "funeral";

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface Occasion {
  id: OccasionId;
  label: string;
  emoji: string;
  description: string;
  weights: ScoreWeights;
}

export interface ScoreWeights {
  occasion: number;
  formality: number;
  color: number;
  silhouette: number;
  seasonal: number;
  detail: number;
}

export interface ScoreSet {
  occasion: number;
  formality: number;
  color: number;
  silhouette: number;
  seasonal: number;
  detail: number;
}

export interface AnalysisConditions {
  companion: string | null;
  place: string | null;
  mood: string | null;
  season: Season;
  note: string;
}

export interface FeedbackItem {
  title: string;
  body: string;
}

export interface PrimaryRecommendation {
  from: string;
  to: string;
  reason: string;
  scoreBefore: number;
  scoreAfter: number;
}

export type ItemStatus = "good" | "adjust" | "recommend";

export interface OutfitItemAnalysis {
  slot: string;
  name: string;
  status: ItemStatus;
  comment: string;
}

export interface AlternativeLook {
  name: string;
  summary: string;
  mood: string;
  fitScore: number;
  changedItems: number;
}

export interface WardrobeSuggestion {
  itemName: string;
  slot: string;
  message: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  image: string; // data URL
  isSample: boolean;
  sampleId?: string;
  occasion: OccasionId;
  conditions: AnalysisConditions;
  overallScore: number;
  scores: ScoreSet;
  summary: string;
  positives: FeedbackItem[];
  improvements: FeedbackItem[];
  primaryRecommendation: PrimaryRecommendation;
  items: OutfitItemAnalysis[];
  alternatives: AlternativeLook[];
  wardrobeSuggestion: WardrobeSuggestion | null;
  favorite: boolean;
}

export interface DemoSample {
  id: string;
  name: string;
  occasion: OccasionId;
  outfit: string;
  baseScores: ScoreSet;
  palette: {
    top: string;
    bottom: string;
    outer?: string;
    shoes: string;
    bg: string;
  };
  items: { slot: string; name: string }[];
}

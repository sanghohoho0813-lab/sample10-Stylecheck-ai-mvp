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
  /** Outfit slot the change targets (상의 / 신발 / 아우터 …). */
  slot: string;
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

/** How one of the user's conditions (계절·만나는 사람·장소·원하는 느낌) moved the verdict. */
export interface ConditionNote {
  tone: "good" | "adjust";
  text: string;
  /** Points this condition added to / removed from the overall score. */
  impact: number;
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
  /** Deterministic engine input — lets a shared link rebuild the same result on another device. */
  imageKey?: string;
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
  /** Condition effects, most actionable first. Absent on records made before conditions were scored. */
  conditionNotes?: ConditionNote[];
  favorite: boolean;
  /**
   * When the user committed to the primary recommendation ("추천대로 바꿔 입기").
   * This is the flow's completion event and is reflected in history and stats.
   */
  appliedAt?: string | null;
}

export interface DemoSample {
  id: string;
  name: string;
  occasion: OccasionId;
  outfit: string;
  /** Public path of the look photo (3:4). */
  image: string;
  baseScores: ScoreSet;
  /** Seasons the look is dressed for — other seasons lower 계절 적합성. */
  seasons: Season[];
  items: { slot: string; name: string }[];
  /** Sample-specific "한 가지만 바꾼다면" copy matched to the photo. */
  recommendation: { from: string; to: string; reason: string };
  /** Wardrobe item offered as the swap for this look. */
  wardrobe: WardrobeSuggestion;
}

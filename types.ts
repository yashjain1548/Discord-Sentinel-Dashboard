export interface AnalysisResult {
  sentiment_score: number;
  primary_topic: string;
  is_toxic: boolean;
}

export interface DiscordMessage {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult;
  isAnalyzing: boolean;
}

export interface HealthStats {
  avgSentiment: number;
  topTopic: string;
  totalMessages: number;
  toxicityRate: number;
}
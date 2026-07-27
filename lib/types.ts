import type { PainLabel } from "./taxonomy";
import type { SourceCategory } from "./sources";

export interface ResearchFinding {
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  category: SourceCategory;
  capturedAt: string; // ISO date the finding was verified
  summary: string;
  painLabels: PainLabel[];
}

export interface NlpAnalysis {
  generatedAt: string;
  method: {
    embeddingModel: string;
    nliModel: string;
    clustering: string;
    sentiment: string;
  };
  corpus: {
    totalChunks: number;
    uniqueChunks: number;
    duplicateChunks: number;
    clusterCount: number;
  };
  taxonomyDistribution: { label: PainLabel; title: string; count: number }[];
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  findings: {
    chunkId: string;
    sourceLabel: string;
    sourceUrl: string;
    text: string;
    label: PainLabel;
    score: number;
    sentiment: "positive" | "neutral" | "negative";
  }[];
  topClusters: {
    clusterId: number;
    size: number;
    sourceLabels: string[];
    exampleTexts: string[];
  }[];
  knownLimitations: string[];
}

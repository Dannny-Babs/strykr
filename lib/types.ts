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

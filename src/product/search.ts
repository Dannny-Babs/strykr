import type { EntityType } from "@/product/entity-navigation";

export type GlobalSearchResult = {
  type: EntityType;
  id: string;
  primaryLabel: string;
  secondaryLabel: string;
  status?: string;
};

export function normalizeGlobalSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isSearchableQuery(value: string) {
  return normalizeGlobalSearchQuery(value).length >= 2;
}

export const entityTypes = ["dealership", "transaction", "exception", "document", "import", "audit", "run"] as const;

export type EntityType = (typeof entityTypes)[number];

export function parseEntityQuery(searchParams: URLSearchParams): { type: EntityType; id: string } | null {
  const type = searchParams.get("entity");
  const id = searchParams.get("entityId")?.trim();
  if (!id || !entityTypes.includes(type as EntityType)) return null;
  return { type: type as EntityType, id };
}

function splitHref(href: string) {
  const [pathname, query = ""] = href.split("?", 2);
  return { pathname, params: new URLSearchParams(query) };
}

function joinHref(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function entityHref(href: string, type: EntityType, id: string) {
  const { pathname, params } = splitHref(href);
  params.set("entity", type);
  params.set("entityId", id);
  return joinHref(pathname, params);
}

export function closeEntityHref(href: string) {
  const { pathname, params } = splitHref(href);
  params.delete("entity");
  params.delete("entityId");
  return joinHref(pathname, params);
}

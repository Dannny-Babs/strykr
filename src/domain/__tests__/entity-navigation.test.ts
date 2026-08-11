import { describe, expect, it } from "vitest";
import { closeEntityHref, entityHref, parseEntityQuery } from "@/product/entity-navigation";

describe("entity drawer URL state", () => {
  it("adds a selected entity without dropping filters or pagination", () => {
    expect(entityHref("/reviewer/exceptions?status=NEW&page=2", "exception", "exc 42")).toBe(
      "/reviewer/exceptions?status=NEW&page=2&entity=exception&entityId=exc+42",
    );
  });

  it("replaces an existing selected entity", () => {
    expect(entityHref("/dealer/transactions?entity=transaction&entityId=old", "transaction", "new")).toBe(
      "/dealer/transactions?entity=transaction&entityId=new",
    );
  });

  it("closes the drawer without dropping the surrounding view", () => {
    expect(closeEntityHref("/reviewer/dealerships?q=north&entity=dealership&entityId=dealer-1")).toBe(
      "/reviewer/dealerships?q=north",
    );
  });

  it("accepts only supported entity types with a non-empty id", () => {
    expect(parseEntityQuery(new URLSearchParams("entity=exception&entityId=exc-1"))).toEqual({ type: "exception", id: "exc-1" });
    expect(parseEntityQuery(new URLSearchParams("entity=unknown&entityId=exc-1"))).toBeNull();
    expect(parseEntityQuery(new URLSearchParams("entity=exception"))).toBeNull();
  });
});

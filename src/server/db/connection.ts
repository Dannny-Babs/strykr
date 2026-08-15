export function withVerifiedSsl(connectionString: string) {
  const url = new URL(connectionString);
  if (url.protocol === "postgres:" || url.protocol === "postgresql:") {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

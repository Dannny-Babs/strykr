export function authRedirectOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const requested = new URL(request.url);
  const isTrustedHost = requested.hostname === "localhost" || requested.hostname === "127.0.0.1" || requested.hostname === "cordena.vercel.app" || requested.hostname.endsWith(".vercel.app");
  if (isTrustedHost) return requested.origin;
  if (configured) return new URL(configured).origin;
  throw new Error("Authentication redirect origin is not configured.");
}

const isSecure = process.env.STAGE !== "local";

export const ONE_HOUR = 60 * 60;
export const THIRTY_DAYS = 30 * 24 * 60 * 60;

export function setCookie(name: string, value: string, maxAge: number): string {
  const parts = [`${name}=${value}`, "HttpOnly", "SameSite=Strict", "Path=/", `Max-Age=${maxAge}`];
  if (isSecure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name: string): string {
  const parts = [`${name}=`, "HttpOnly", "SameSite=Strict", "Path=/", "Max-Age=0"];
  if (isSecure) parts.push("Secure");
  return parts.join("; ");
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key.trim(), rest.join("=")];
    }),
  );
}

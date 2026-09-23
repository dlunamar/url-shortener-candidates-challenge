import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) {
    const [a = -1, b = -1] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
    return false;
  }
  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(lower)) return true;
    return false;
  }
  return true;
}

/**
 * Basic SSRF guard for shortening targets. Allows only http(s) hosts that
 * resolve exclusively to public IPs. Fail-closed: literals in blocked
 * ranges, unresolvable hosts and non-http(s) URLs are rejected.
 */
export async function isUrlSafe(target: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }
  if (isBlockedIp(url.hostname)) {
    return false;
  }
  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(url.hostname, { all: true });
  } catch {
    return false;
  }
  return addresses.every((entry) => !isBlockedIp(entry.address));
}

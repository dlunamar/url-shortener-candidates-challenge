import { describe, expect, it } from "vitest";
import { isUrlSafe } from "./url-safety.server";

describe("isUrlSafe", () => {
  it("rejects non-http(s) and malformed URLs without DNS", async () => {
    await expect(isUrlSafe("javascript:alert(1)")).resolves.toBe(false);
    await expect(isUrlSafe("ftp://example.com")).resolves.toBe(false);
    await expect(isUrlSafe("not-a-url")).resolves.toBe(false);
  });

  it("rejects blocked IP literals without DNS", async () => {
    await expect(isUrlSafe("http://127.0.0.1/")).resolves.toBe(false);
    await expect(isUrlSafe("http://10.0.0.5/x")).resolves.toBe(false);
    await expect(isUrlSafe("http://192.168.1.1/")).resolves.toBe(false);
    await expect(isUrlSafe("http://172.16.0.1/")).resolves.toBe(false);
    await expect(isUrlSafe("http://169.254.169.254/")).resolves.toBe(false);
    await expect(isUrlSafe("http://0.0.0.0/")).resolves.toBe(false);
    await expect(isUrlSafe("http://[::1]/")).resolves.toBe(false);
  });

  it("rejects unresolvable hosts (fail-closed)", async () => {
    await expect(isUrlSafe("http://nonexistent.invalid/")).resolves.toBe(
      false,
    );
  });

  it("allows a public IP literal (numeric lookup needs no network)", async () => {
    await expect(isUrlSafe("http://93.184.216.0/")).resolves.toBe(true);
  });

  it("allows a hostname resolving only to public IPs (stubbed DNS)", async () => {
    const resolve = async () => [
      { address: "93.184.216.34" },
      { address: "2606:2800:220:1:248:1893:25c8:1946" },
    ];
    await expect(
      isUrlSafe("https://example.com", resolve),
    ).resolves.toBe(true);
    // The resolver must actually be consulted for hostnames.
    let called = false;
    await isUrlSafe("https://example.com", async () => {
      called = true;
      return [{ address: "93.184.216.34" }];
    });
    expect(called).toBe(true);
  });

  it("rejects a hostname resolving to a blocked IP (stubbed DNS)", async () => {
    const resolve = async () => [{ address: "10.1.2.3" }];
    await expect(
      isUrlSafe("https://internal.example", resolve),
    ).resolves.toBe(false);
  });

  it("rejects when resolution fails (stubbed DNS)", async () => {
    const resolve = async (): Promise<Array<{ address: string }>> => {
      throw new Error("ENOTFOUND");
    };
    await expect(
      isUrlSafe("https://example.com", resolve),
    ).resolves.toBe(false);
  });
});

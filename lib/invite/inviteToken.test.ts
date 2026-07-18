import { describe, expect, it } from "vitest";
import { extractInviteToken } from "@/lib/invite/inviteToken";

describe("extractInviteToken", () => {
  it("parses momentra://invite/{token}", () => {
    expect(extractInviteToken("momentra://invite/abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("parses https://momentra.tech/invite/{token}", () => {
    expect(extractInviteToken("https://momentra.tech/invite/abc.def.ghi")).toBe(
      "abc.def.ghi",
    );
  });

  it("parses apex https://momentra.tech/{token}", () => {
    expect(extractInviteToken("https://momentra.tech/abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("parses www host", () => {
    expect(extractInviteToken("https://www.momentra.tech/invite/tok12345")).toBe(
      "tok12345",
    );
  });

  it("returns raw token when not a URL", () => {
    expect(extractInviteToken("rawtoken12")).toBe("rawtoken12");
  });
});

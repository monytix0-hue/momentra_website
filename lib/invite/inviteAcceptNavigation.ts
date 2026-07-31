/** Shared helpers for opaque invite post-accept selection (web). */

export type InviteAcceptTarget = {
  momentId: string;
  momentType: string | null;
  outcome: string;
  alreadyMember: boolean;
  momentName: string;
};

export function resolveInviteAcceptTarget(input: {
  moment_id?: string | null;
  target_id?: string | null;
  moment_type?: string | null;
  result?: string | null;
  already_member?: boolean | null;
  moment_name?: string | null;
}): InviteAcceptTarget | null {
  const id = String(input.moment_id || input.target_id || "").trim();
  if (!id) return null;
  const outcome = String(
    input.result || (input.already_member ? "ALREADY_MEMBER" : "ACCEPTED"),
  ).toUpperCase();
  if (!["ACCEPTED", "ALREADY_MEMBER", "ALREADY_ACCEPTED"].includes(outcome)) {
    return null;
  }
  return {
    momentId: id,
    momentType: input.moment_type ?? null,
    outcome,
    alreadyMember: Boolean(input.already_member) || outcome !== "ACCEPTED",
    momentName: (input.moment_name || "").trim() || "Your moment",
  };
}

/** New deep-link token wins; true when previous pending differed. */
export function shouldFlagPendingMismatch(
  previousToken: string | null | undefined,
  incomingToken: string,
): boolean {
  const prev = (previousToken || "").trim();
  const next = incomingToken.trim();
  if (!prev || !next) return false;
  return prev.toUpperCase() !== next.toUpperCase();
}

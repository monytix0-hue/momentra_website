import {
  archiveGroupMoment,
  completeGroupMoment,
  patchGroupMoment,
} from "@/lib/api/client";
import {
  createEmailInvite,
  getActiveLife,
  getActiveMemory,
  getActiveMoments,
  getActivePulse,
  getInviteDraft,
  refreshInviteDraft,
  getSettlementPreview,
  getSetupProfiles,
  listSettlements,
  markSettlementSettled,
} from "@/lib/api/group";
import type { GroupMomentUpdateRequest } from "@/lib/api/client";
import { fetchGroupSessionBootstrapDeduped } from "@/hooks/useGroupTabCache";

export const GroupRepository = {
  getSessionBootstrap: fetchGroupSessionBootstrapDeduped,
  getSetupProfiles,
  getActivePulse,
  getActiveMoments,
  getActiveMemory,
  getActiveLife,
  getInviteDraft,
  refreshInviteDraft,
  createEmailInvite,
  getSettlementPreview,
  listSettlements,
  markSettlementSettled,
  patchMoment: (momentId: string, body: GroupMomentUpdateRequest) =>
    patchGroupMoment(momentId, body),
  completeMoment: completeGroupMoment,
  archiveMoment: archiveGroupMoment,
};

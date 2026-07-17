"use client";

import { GroupActionCenterShell } from "@/components/group/action-center/GroupActionCenterShell";

type GroupMomentQuickAddRouterProps = {
  momentId: string;
  momentTypeCode: string;
  onClose: () => void;
  onSuccess?: () => void;
};

/** Cutover: Group FAB opens Action Center for all Group templates. */
export function GroupMomentQuickAddRouter({
  momentId,
  momentTypeCode,
  onClose,
  onSuccess,
}: GroupMomentQuickAddRouterProps) {
  const supported =
    momentTypeCode === "SHARED_EXPERIENCE" ||
    momentTypeCode === "SHARED_PURCHASE" ||
    momentTypeCode === "SHARED_LIVING";

  if (!supported) {
    return (
      <GroupActionCenterShell
        momentId={momentId}
        momentTypeCode="SHARED_EXPERIENCE"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <GroupActionCenterShell
      momentId={momentId}
      momentTypeCode={momentTypeCode}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

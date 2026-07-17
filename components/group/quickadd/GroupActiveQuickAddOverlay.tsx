"use client";

import { GroupMomentQuickAddRouter } from "@/components/group/quickadd/GroupMomentQuickAddRouter";

type GroupActiveQuickAddOverlayProps = {
  momentId: string;
  momentTypeCode?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function GroupActiveQuickAddOverlay({
  momentId,
  momentTypeCode = "SHARED_EXPERIENCE",
  onClose,
  onSuccess,
}: GroupActiveQuickAddOverlayProps) {
  return (
    <GroupMomentQuickAddRouter
      momentId={momentId}
      momentTypeCode={momentTypeCode}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

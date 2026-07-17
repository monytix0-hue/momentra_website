"use client";

import { ContextMomentHeader } from "@/components/shared/ContextMomentHeader";
import type { GroupMomentSwitcherOption } from "@/components/group/shared/groupMomentRouting";
import type { GroupMomentTypeCode } from "@/lib/group/groupMomentSession";

type GroupMomentHeaderProps = {
  tabLabel: string;
  options: GroupMomentSwitcherOption[];
  selectedTypeCode: GroupMomentTypeCode;
  onSelect: (option: GroupMomentSwitcherOption) => void;
  onManageClick?: () => void;
};

export function GroupMomentHeader(props: GroupMomentHeaderProps) {
  return (
    <ContextMomentHeader
      contextLabel="Group"
      tabLabel={props.tabLabel}
      options={props.options}
      selectedTypeCode={props.selectedTypeCode}
      onSelect={(option) => props.onSelect(option as GroupMomentSwitcherOption)}
      onManageClick={props.onManageClick}
      accentVariant="group"
    />
  );
}

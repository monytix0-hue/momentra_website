"use client";

import type { BusinessActivityListItem } from "@/lib/api/businessActive";
import { TEAM_OPS_ACTION_META, type TeamOpsActionType } from "@/lib/business/teamOpsActionRegistry";
import { formatOccurredAt, TEAM_OPS } from "../shared/teamOpsTheme";

type Props = {
  item: BusinessActivityListItem;
  onSelect: (item: BusinessActivityListItem) => void;
  onEdit?: (item: BusinessActivityListItem) => void;
  actionMeta?: Record<string, { label: string }>;
};

export function TeamOperationsActivityRow({ item, onSelect, onEdit, actionMeta }: Props) {
  const meta =
    actionMeta?.[item.action_type] ??
    TEAM_OPS_ACTION_META[item.action_type as TeamOpsActionType];
  return (
    <li>
      <div
        className="flex w-full items-stretch gap-1 rounded-xl"
        style={{
          background: TEAM_OPS.surfaceLow,
          border: `1px solid ${TEAM_OPS.outline}22`,
          minHeight: 48,
        }}
      >
        <button
          type="button"
          className="min-w-0 flex-1 px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => onSelect(item)}
          aria-label={`${item.title || item.action_type}, ${item.action_type}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: TEAM_OPS.onSurface }}>
                {item.title || item.action_type}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: TEAM_OPS.onVariant }}>
                {meta?.label || item.action_type}
                {item.occurred_at || item.created_at
                  ? ` · ${formatOccurredAt(String(item.occurred_at || item.created_at))}`
                  : ""}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{ background: `${TEAM_OPS.primary}22`, color: TEAM_OPS.primary }}
            >
              {item.is_voided ? "voided" : "active"}
            </span>
          </div>
        </button>
        {item.is_editable && onEdit ? (
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center self-center border-0 bg-transparent"
            aria-label="Edit"
            onClick={() => onEdit(item)}
          >
            <span style={{ color: TEAM_OPS.onVariant, opacity: 0.85, fontSize: 18, lineHeight: 1 }}>⋯</span>
          </button>
        ) : null}
      </div>
    </li>
  );
}

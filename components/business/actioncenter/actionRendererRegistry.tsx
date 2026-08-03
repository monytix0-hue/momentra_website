"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type {
  BusinessCatalogAction,
  BusinessCatalogMember,
  BusinessCatalogVendor,
  BusinessRendererMeta,
} from "@/repositories/BusinessActionRepository";
import { SchemaDrivenRenderer } from "@/components/business/actioncenter/renderers/SchemaDrivenRenderer";
import { LoadingIndicator } from "@/components/shared/LoadingIndicator";

export type BusinessActionRendererProps = {
  action: BusinessCatalogAction;
  momentId: string;
  templateId: string;
  members: BusinessCatalogMember[];
  vendors?: BusinessCatalogVendor[];
  rendererMeta: BusinessRendererMeta | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSuccess?: (result?: {
    action_type: string;
    title: string;
    mutationResponse?: unknown;
  }) => void;
  onSwitchAction?: (actionId: string) => void;
  /** Company / moment name shown as plain text on the form (not a chip). */
  contextLine?: string | null;
};

const loading = () => (
  <LoadingIndicator label="Loading…" className="py-10" size="sm" />
);

const lazy = <T extends ComponentType<BusinessActionRendererProps>>(
  factory: () => Promise<{ default: T }>,
) => dynamic(factory, { loading, ssr: false });

function SchemaFallback(props: BusinessActionRendererProps) {
  if (!props.rendererMeta) {
    return <LoadingIndicator label="Loading form…" className="py-8" size="sm" />;
  }
  const amountField = props.rendererMeta.fields.find((f) => f.field_type === "amount");
  return (
    <SchemaDrivenRenderer
      {...props}
      rendererMeta={props.rendererMeta}
      titleKey={
        props.rendererMeta.fields.some((f) => f.key === "title")
          ? "title"
          : props.rendererMeta.fields.find((f) => f.field_type === "text")?.key
      }
      amountKey={amountField?.key}
    />
  );
}

export const BUSINESS_RENDERER_REGISTRY: Record<
  string,
  ComponentType<BusinessActionRendererProps>
> = {
  "schema.generic": SchemaFallback,

  "team_ops.team_update": SchemaFallback,
  "team_ops.recognition": SchemaFallback,
  "team_ops.meeting": lazy(() =>
    import("@/components/business/actioncenter/renderers/team_ops").then((m) => ({
      default: m.MeetingRenderer,
    })),
  ),
  "team_ops.issue": lazy(() =>
    import("@/components/business/actioncenter/renderers/team_ops").then((m) => ({
      default: m.IssueRenderer,
    })),
  ),
  "team_ops.approval": lazy(() =>
    import("@/components/business/actioncenter/renderers/team_ops").then((m) => ({
      default: m.ApprovalRenderer,
    })),
  ),
  "team_ops.review": SchemaFallback,
  "team_ops.escalation": lazy(() =>
    import("@/components/business/actioncenter/renderers/team_ops").then((m) => ({
      default: m.EscalationRenderer,
    })),
  ),
  "team_ops.participation": SchemaFallback,
  "team_ops.member_update": lazy(() =>
    import("@/components/business/actioncenter/renderers/team_ops").then((m) => ({
      default: m.MemberUpdateRenderer,
    })),
  ),
  "team_ops.note": SchemaFallback,

  "runway.cash_inflow": lazy(() =>
    import("@/components/business/actioncenter/renderers/runway").then((m) => ({
      default: m.CashInflowRenderer,
    })),
  ),
  "runway.expense_burn": lazy(() =>
    import("@/components/business/actioncenter/renderers/runway").then((m) => ({
      default: m.ExpenseBurnRenderer,
    })),
  ),
  "runway.runway_risk": lazy(() =>
    import("@/components/business/actioncenter/renderers/runway").then((m) => ({
      default: m.RunwayRiskRenderer,
    })),
  ),
  "runway.financial_update": lazy(() =>
    import("@/components/business/actioncenter/renderers/runway").then((m) => ({
      default: m.FinancialUpdateRenderer,
    })),
  ),
  "runway.strategic_decision": lazy(() =>
    import("@/components/business/actioncenter/renderers/runway").then((m) => ({
      default: m.StrategicDecisionRenderer,
    })),
  ),

  // Spend uses catalog schema (vendor picker + payment fields) — same as frontend.
  "ops.spend_entry": SchemaFallback,
  "ops.vendor_update": lazy(() =>
    import("@/components/business/actioncenter/renderers/ops").then((m) => ({
      default: m.VendorUpdateRenderer,
    })),
  ),
  "ops.approval": lazy(() =>
    import("@/components/business/actioncenter/renderers/ops").then((m) => ({
      default: m.OpsApprovalRenderer,
    })),
  ),
  "ops.issue": lazy(() =>
    import("@/components/business/actioncenter/renderers/ops").then((m) => ({
      default: m.OpsIssueRenderer,
    })),
  ),
  "ops.operational_improvement": lazy(() =>
    import("@/components/business/actioncenter/renderers/ops").then((m) => ({
      default: m.OperationalImprovementRenderer,
    })),
  ),
  "ops.general_update": lazy(() =>
    import("@/components/business/actioncenter/renderers/ops").then((m) => ({
      default: m.OpsGeneralUpdateRenderer,
    })),
  ),
};

export const ALL_BUSINESS_RENDERER_IDS = Object.keys(BUSINESS_RENDERER_REGISTRY);

export function resolveBusinessActionRenderer(
  rendererId: string | undefined,
): ComponentType<BusinessActionRendererProps> | null {
  if (!rendererId) return SchemaFallback;
  return BUSINESS_RENDERER_REGISTRY[rendererId] ?? SchemaFallback;
}

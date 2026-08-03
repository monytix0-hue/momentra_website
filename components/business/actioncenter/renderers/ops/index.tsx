"use client";

import {
  ProgressiveActionForm,
  type FormState,
  type ProgressiveStep,
} from "@/components/business/actioncenter/ProgressiveActionForm";
import {
  TextField,
  TextArea,
  MoneyInput,
  DateInput,
  CurrencyPicker,
  ChipSelector,
  SelectField,
  VendorPicker,
  MemberPicker,
  MemberMultiPicker,
  Toggle,
  formatMoneyDisplay,
} from "@/components/business/actioncenter/fields";
import type { BusinessActionRendererProps } from "@/components/business/actioncenter/actionRendererRegistry";
import {
  chipLabel,
  memberLabel,
  moneyPayload,
  req,
  reqAmount,
  todayISO,
} from "@/components/business/actioncenter/renderers/dedicatedHelpers";

const SPEND_CATEGORIES = [
  { value: "purchase", label: "Purchase" },
  { value: "vendor_payment", label: "Vendor payment" },
  { value: "staff_cost", label: "Staff cost" },
  { value: "utility_bill", label: "Utilities" },
  { value: "travel_expense", label: "Travel" },
  { value: "rent", label: "Rent" },
  { value: "marketing_spend", label: "Marketing" },
  { value: "other", label: "Other" },
];

const VENDOR_EVENTS = [
  { value: "new_vendor", label: "New vendor" },
  { value: "vendor_issue", label: "Issue" },
  { value: "contract_renewal", label: "Renewal" },
  { value: "contract_change", label: "Contract update" },
  { value: "payment_status", label: "Payment update" },
  { value: "contact_update", label: "Contact update" },
  { value: "vendor_suspension", label: "Vendor closed" },
  { value: "other", label: "Other" },
];

const VENDOR_STATUS = [
  { value: "active", label: "Open" },
  { value: "under_review", label: "In progress" },
  { value: "terminated", label: "Resolved" },
];

const SEVERITY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const IMPROVEMENT_TYPES = [
  { value: "process_improvement", label: "Process" },
  { value: "budget_control_improvement", label: "Budget control" },
  { value: "inventory_improvement", label: "Inventory" },
  { value: "vendor_experience_improvement", label: "Vendor management" },
  { value: "staffing_scheduling_improvement", label: "Staff" },
  { value: "compliance_improvement", label: "Compliance" },
  { value: "service_quality_improvement", label: "Customer service" },
  { value: "operational_control_improvement", label: "Technology" },
  { value: "approval_flow_improvement", label: "Approvals" },
  { value: "other", label: "Other" },
];

const IMPROVEMENT_PRIORITY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const EXPECTED_IMPACT = [
  { value: "improve_speed", label: "Save time" },
  { value: "reduce_cost", label: "Reduce cost" },
  { value: "improve_service", label: "Improve quality" },
  { value: "reduce_issues", label: "Reduce risk" },
  { value: "increase_revenue", label: "Increase revenue" },
  { value: "other", label: "Other" },
];

const REQUEST_TYPES = [
  { value: "purchase", label: "Purchase" },
  { value: "vendor_approval", label: "Vendor payment" },
  { value: "expense_approval", label: "Expense" },
  { value: "budget_change", label: "Budget change" },
  { value: "hiring", label: "Hiring" },
  { value: "operational_request", label: "Operational change" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

const APPROVAL_PRIORITY = [
  { value: "medium", label: "Normal" },
  { value: "high", label: "Urgent" },
];

function asIds(v: FormState[string]): string[] {
  return Array.isArray(v) ? v.filter(Boolean) : [];
}

function DedicatedShell({
  props,
  steps,
  buildPayload,
  buildReviewRows,
  draftTitleKey = "title",
  initialState,
  saveLabel,
  reviewEnabled = true,
}: {
  props: BusinessActionRendererProps;
  steps: ProgressiveStep[];
  buildPayload: (s: FormState) => Record<string, unknown>;
  buildReviewRows: (s: FormState) => Array<{ label: string; value: string }>;
  draftTitleKey?: string;
  initialState?: FormState;
  saveLabel?: string;
  reviewEnabled?: boolean;
}) {
  return (
    <ProgressiveActionForm
      action={props.action}
      momentId={props.momentId}
      templateId={props.templateId}
      steps={steps}
      buildPayload={buildPayload}
      buildReviewRows={buildReviewRows}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      onSuccess={props.onSuccess}
      draftTitleKey={draftTitleKey}
      initialState={initialState}
      saveLabel={saveLabel ?? props.action.cta_label}
      reviewEnabled={reviewEnabled}
      contextLine={props.contextLine}
    />
  );
}

export function SpendEntryRenderer(props: BusinessActionRendererProps) {
  const notifyDefault = Boolean(props.action.notify_defaults?.notify_managers);
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "Spend details",
      validate: (s) => ({
        ...req(s, "title", "Spend name"),
        ...reqAmount(s),
        ...req(s, "spend_category", "Category"),
        ...req(s, "spend_date", "Date"),
      }),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <TextField
            label="What was this spend for?"
            value={String(state.title ?? "")}
            onChange={(v) => set("title", v)}
            required
            error={errors.title}
          />
          <MoneyInput
            label="Amount"
            value={String(state.amount ?? "")}
            onChange={(v) => set("amount", v)}
            required
            error={errors.amount}
            currencyCode={String(state.currency_code ?? "INR")}
          />
          <CurrencyPicker
            value={String(state.currency_code ?? "INR")}
            onChange={(v) => set("currency_code", v)}
          />
          <SelectField
            label="Category"
            value={String(state.spend_category ?? "")}
            onChange={(v) => set("spend_category", v)}
            options={SPEND_CATEGORIES}
            required
            error={errors.spend_category}
          />
          <VendorPicker
            label="Paid to / Vendor"
            value={String(state.vendor_name ?? "")}
            onChange={(v) => set("vendor_name", v)}
          />
          <DateInput
            label="Date"
            value={String(state.spend_date ?? "")}
            onChange={(v) => set("spend_date", v)}
            required
            error={errors.spend_date}
          />
          <TextArea
            label="Notes"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
          <Toggle
            label="Notify managers"
            value={Boolean(state.notify_managers)}
            onChange={(v) => set("notify_managers", v)}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      initialState={{
        currency_code: "INR",
        spend_date: todayISO(),
        notify_managers: notifyDefault,
      }}
      saveLabel="Save spend"
      buildPayload={(s) => ({
        title: s.title,
        ...moneyPayload(s),
        spend_category: s.spend_category,
        spend_date: s.spend_date,
        vendor_name: s.vendor_name || undefined,
        description: s.description || undefined,
        notify_managers: Boolean(s.notify_managers),
        post_to_activity: true,
      })}
      buildReviewRows={(s) => [
        { label: "Spend", value: String(s.title ?? "") },
        { label: "Amount", value: formatMoneyDisplay(String(s.amount ?? ""), String(s.currency_code ?? "INR")) },
        { label: "Category", value: chipLabel(SPEND_CATEGORIES, String(s.spend_category ?? "")) },
        { label: "Date", value: String(s.spend_date ?? "") },
        { label: "Vendor", value: String(s.vendor_name || "—") },
        { label: "Notify managers", value: s.notify_managers ? "Yes" : "No" },
      ]}
    />
  );
}

export function VendorUpdateRenderer(props: BusinessActionRendererProps) {
  const notifyDefault = Boolean(props.action.notify_defaults?.notify_managers);
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "Vendor update",
      validate: (s) => ({
        ...req(s, "vendor_name", "Vendor name"),
        ...req(s, "vendor_event_type", "Update type"),
      }),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <VendorPicker
            label="Vendor"
            value={String(state.vendor_name ?? "")}
            onChange={(v) => set("vendor_name", v)}
            required
            error={errors.vendor_name}
          />
          <SelectField
            label="Update type"
            value={String(state.vendor_event_type ?? "")}
            onChange={(v) => set("vendor_event_type", v)}
            options={VENDOR_EVENTS}
            required
            error={errors.vendor_event_type}
          />
          <ChipSelector
            label="Status"
            value={String(state.vendor_status ?? "")}
            onChange={(v) => set("vendor_status", v)}
            options={VENDOR_STATUS}
          />
          <DateInput
            label="Effective date"
            value={String(state.effective_date ?? "")}
            onChange={(v) => set("effective_date", v)}
          />
          <TextArea
            label="Notes"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
          <Toggle
            label="Notify managers"
            value={Boolean(state.notify_managers)}
            onChange={(v) => set("notify_managers", v)}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      draftTitleKey="vendor_name"
      initialState={{ notify_managers: notifyDefault }}
      saveLabel="Save vendor update"
      buildPayload={(s) => ({
        title: String(s.vendor_name || props.action.label),
        vendor_name: s.vendor_name,
        vendor_event_type: s.vendor_event_type,
        vendor_status: s.vendor_status || undefined,
        effective_date: s.effective_date || undefined,
        description: s.description || undefined,
        notify_managers: Boolean(s.notify_managers),
        post_to_activity: true,
      })}
      buildReviewRows={(s) => [
        { label: "Vendor", value: String(s.vendor_name ?? "") },
        { label: "Update type", value: chipLabel(VENDOR_EVENTS, String(s.vendor_event_type ?? "")) },
        { label: "Status", value: chipLabel(VENDOR_STATUS, String(s.vendor_status ?? "")) },
        { label: "Effective date", value: String(s.effective_date || "—") },
        { label: "Notes", value: String(s.description || "—") },
      ]}
    />
  );
}

export function OpsApprovalRenderer(props: BusinessActionRendererProps) {
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "Approval request",
      validate: (s) => ({
        ...req(s, "title", "Request title"),
        ...req(s, "request_type", "Approval type"),
        ...req(s, "approver_ids", "Approvers"),
      }),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <TextField
            label="Request title"
            value={String(state.title ?? "")}
            onChange={(v) => set("title", v)}
            required
            error={errors.title}
          />
          <SelectField
            label="Approval type"
            value={String(state.request_type ?? "")}
            onChange={(v) => set("request_type", v)}
            options={REQUEST_TYPES}
            required
            error={errors.request_type}
          />
          <MoneyInput
            label="Amount"
            value={String(state.amount ?? "")}
            onChange={(v) => set("amount", v)}
            currencyCode={String(state.currency_code ?? "INR")}
          />
          <CurrencyPicker
            value={String(state.currency_code ?? "INR")}
            onChange={(v) => set("currency_code", v)}
          />
          <MemberMultiPicker
            label="Requested from"
            value={asIds(state.approver_ids)}
            onChange={(ids) => set("approver_ids", ids)}
            members={props.members}
            required
            error={errors.approver_ids}
          />
          <DateInput
            label="Due date"
            value={String(state.due_date ?? "")}
            onChange={(v) => set("due_date", v)}
          />
          <ChipSelector
            label="Priority"
            value={String(state.priority ?? "medium")}
            onChange={(v) => set("priority", v)}
            options={APPROVAL_PRIORITY}
          />
          <TextArea
            label="Description"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      initialState={{ currency_code: "INR", priority: "medium", approver_ids: [] }}
      saveLabel="Send approval request"
      buildPayload={(s) => {
        const money = s.amount ? moneyPayload(s) : {};
        return {
          title: s.title,
          request_type: s.request_type,
          ...money,
          approver_ids: asIds(s.approver_ids),
          due_date: s.due_date || undefined,
          priority: s.priority || undefined,
          description: s.description || undefined,
          post_to_activity: true,
        };
      }}
      buildReviewRows={(s) => [
        { label: "Title", value: String(s.title ?? "") },
        { label: "Type", value: chipLabel(REQUEST_TYPES, String(s.request_type ?? "")) },
        {
          label: "Amount",
          value: s.amount
            ? formatMoneyDisplay(String(s.amount), String(s.currency_code ?? "INR"))
            : "—",
        },
        {
          label: "Approvers",
          value:
            asIds(s.approver_ids)
              .map((id) => memberLabel(props.members, id))
              .join(", ") || "—",
        },
        { label: "Due date", value: String(s.due_date || "—") },
        { label: "Priority", value: chipLabel(APPROVAL_PRIORITY, String(s.priority ?? "")) },
        { label: "Description", value: String(s.description || "—") },
      ]}
    />
  );
}

export function OpsIssueRenderer(props: BusinessActionRendererProps) {
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "Issue details",
      validate: (s) => ({
        ...req(s, "title", "Issue title"),
        ...req(s, "severity", "Severity"),
      }),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <TextField
            label="Issue title"
            value={String(state.title ?? "")}
            onChange={(v) => set("title", v)}
            required
            error={errors.title}
          />
          <ChipSelector
            label="Severity"
            value={String(state.severity ?? "")}
            onChange={(v) => set("severity", v)}
            options={SEVERITY}
            required
            error={errors.severity}
          />
          <MemberPicker
            label="Owner"
            value={String(state.owner_id ?? "")}
            onChange={(v) => set("owner_id", v)}
            members={props.members}
          />
          <DateInput
            label="Target date"
            value={String(state.target_resolution_date ?? "")}
            onChange={(v) => set("target_resolution_date", v)}
          />
          <TextArea
            label="Description"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      saveLabel="Log issue"
      buildPayload={(s) => ({
        title: s.title,
        severity: s.severity,
        owner_id: s.owner_id || undefined,
        target_resolution_date: s.target_resolution_date || undefined,
        description: s.description || undefined,
        post_to_activity: true,
      })}
      buildReviewRows={(s) => [
        { label: "Title", value: String(s.title ?? "") },
        { label: "Severity", value: chipLabel(SEVERITY, String(s.severity ?? "")) },
        { label: "Owner", value: memberLabel(props.members, String(s.owner_id ?? "")) },
        { label: "Target date", value: String(s.target_resolution_date || "—") },
        { label: "Description", value: String(s.description || "—") },
      ]}
    />
  );
}

export function OperationalImprovementRenderer(props: BusinessActionRendererProps) {
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "Improvement",
      validate: (s) => ({
        ...req(s, "title", "Improvement"),
        ...req(s, "improvement_type", "Area"),
      }),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <TextField
            label="Improvement title"
            value={String(state.title ?? "")}
            onChange={(v) => set("title", v)}
            required
            error={errors.title}
          />
          <SelectField
            label="Area"
            value={String(state.improvement_type ?? "")}
            onChange={(v) => set("improvement_type", v)}
            options={IMPROVEMENT_TYPES}
            required
            error={errors.improvement_type}
          />
          <ChipSelector
            label="Priority"
            value={String(state.priority ?? "")}
            onChange={(v) => set("priority", v)}
            options={IMPROVEMENT_PRIORITY}
          />
          <SelectField
            label="Expected impact"
            value={String(state.expected_impact ?? "")}
            onChange={(v) => set("expected_impact", v)}
            options={EXPECTED_IMPACT}
          />
          <MemberPicker
            label="Owner"
            value={String(state.owner_id ?? "")}
            onChange={(v) => set("owner_id", v)}
            members={props.members}
          />
          <DateInput
            label="Target date"
            value={String(state.target_date ?? "")}
            onChange={(v) => set("target_date", v)}
          />
          <TextArea
            label="Details"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      saveLabel="Save improvement"
      reviewEnabled
      buildPayload={(s) => ({
        title: s.title,
        improvement_type: s.improvement_type,
        priority: s.priority || undefined,
        expected_impact: s.expected_impact || undefined,
        owner_id: s.owner_id || undefined,
        target_date: s.target_date || undefined,
        description: s.description || undefined,
        post_to_activity: true,
      })}
      buildReviewRows={(s) => [
        { label: "Improvement", value: String(s.title ?? "") },
        { label: "Area", value: chipLabel(IMPROVEMENT_TYPES, String(s.improvement_type ?? "")) },
        { label: "Priority", value: chipLabel(IMPROVEMENT_PRIORITY, String(s.priority ?? "")) },
        { label: "Impact", value: chipLabel(EXPECTED_IMPACT, String(s.expected_impact ?? "")) },
        { label: "Owner", value: memberLabel(props.members, String(s.owner_id ?? "")) },
        { label: "Target date", value: String(s.target_date || "—") },
        { label: "Details", value: String(s.description || "—") },
      ]}
    />
  );
}

export function OpsGeneralUpdateRenderer(props: BusinessActionRendererProps) {
  const notifyDefault = Boolean(props.action.notify_defaults?.notify_managers);
  const steps: ProgressiveStep[] = [
    {
      id: "details",
      title: "General update",
      validate: (s) => req(s, "title", "Update title"),
      render: ({ state, set, errors }) => (
        <div className="space-y-4">
          <TextField
            label="Update title"
            value={String(state.title ?? "")}
            onChange={(v) => set("title", v)}
            required
            error={errors.title}
          />
          <TextArea
            label="Notes"
            value={String(state.description ?? "")}
            onChange={(v) => set("description", v)}
          />
          <Toggle
            label="Notify managers"
            value={Boolean(state.notify_managers)}
            onChange={(v) => set("notify_managers", v)}
          />
          <MemberMultiPicker
            label="Notify members"
            value={asIds(state.notify_user_ids)}
            onChange={(ids) => set("notify_user_ids", ids)}
            members={props.members}
          />
        </div>
      ),
    },
  ];

  return (
    <DedicatedShell
      props={props}
      steps={steps}
      initialState={{ notify_managers: notifyDefault, notify_user_ids: [] }}
      saveLabel="Post update"
      buildPayload={(s) => ({
        title: s.title,
        description: s.description || undefined,
        notify_managers: Boolean(s.notify_managers),
        notify_user_ids: asIds(s.notify_user_ids),
        post_to_activity: true,
      })}
      buildReviewRows={(s) => [
        { label: "Title", value: String(s.title ?? "") },
        { label: "Notes", value: String(s.description || "—") },
        { label: "Notify managers", value: s.notify_managers ? "Yes" : "No" },
        {
          label: "Notify members",
          value:
            asIds(s.notify_user_ids)
              .map((id) => memberLabel(props.members, id))
              .join(", ") || "—",
        },
      ]}
    />
  );
}

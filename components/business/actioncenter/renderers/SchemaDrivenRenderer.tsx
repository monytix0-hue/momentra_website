"use client";

import { useMemo } from "react";
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
  DateTimeInput,
  MemberPicker,
  CurrencyPicker,
  ChipSelector,
  SearchableSelect,
  AttachmentField,
  Toggle,
  NotesField,
  MemberMultiPicker,
  VendorPicker,
  ApprovalPicker,
  CategoryPicker,
  PrioritySelector,
  StatusSelector,
} from "@/components/business/actioncenter/fields";
import type {
  BusinessRendererMeta,
  BusinessRendererField,
  BusinessCatalogMember,
  BusinessCatalogVendor,
} from "@/repositories/BusinessActionRepository";
import type { BusinessActionRendererProps } from "@/components/business/actioncenter/actionRendererRegistry";
import { schemaAmountToMinor, todayISO, chipLabel } from "@/components/business/actioncenter/renderers/dedicatedHelpers";

type SchemaDrivenRendererProps = BusinessActionRendererProps & {
  rendererMeta: BusinessRendererMeta;
  titleKey?: string;
  amountKey?: string;
  buildReviewRows?: (state: FormState) => Array<{ label: string; value: string }>;
  transformPayload?: (raw: Record<string, unknown>) => Record<string, unknown>;
};

function resolveFieldLabel(field: BusinessRendererField, state: FormState): string {
  if (field.label_when?.length) {
    for (const rule of field.label_when) {
      if (String(state[rule.field] ?? "") === rule.equals) return rule.label;
    }
  }
  return field.label;
}

function formatMinor(minor: number, currency = "INR"): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(major);
  } catch {
    return `₹${major.toFixed(2)}`;
  }
}

/** Form state stores major units for amount fields until submit. */
function majorToMinor(raw: FormState[string]): number {
  if (typeof raw === "number" && Number.isInteger(raw)) return raw;
  const n = Number.parseFloat(String(raw ?? "0").replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function computeDueMinor(state: FormState): number {
  const total = majorToMinor(state.amount_minor);
  const status = String(state.payment_status ?? "paid_full");
  if (status === "paid_full") return 0;
  if (status === "unpaid") return total;
  const paid = Math.min(majorToMinor(state.amount_paid_minor), total);
  return Math.max(0, total - paid);
}

function balanceDueLabel(state: FormState, vendors: BusinessCatalogVendor[]): string {
  const raw = String(state.vendor_name ?? "").trim();
  const fromCatalog = vendors.find((v) => v.value === raw)?.label;
  const vendor = fromCatalog || raw || "vendor";
  return `Balance due · ${vendor}`;
}

function BalanceDueBanner({
  state,
  vendors,
}: {
  state: FormState;
  vendors: BusinessCatalogVendor[];
}) {
  const due = computeDueMinor(state);
  if (due <= 0) return null;
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <span className="opacity-80">{balanceDueLabel(state, vendors)}</span>
      <span className="font-semibold">
        {formatMinor(due, String(state.currency_code ?? state.currency ?? "INR"))}
      </span>
    </div>
  );
}

function renderField(
  field: BusinessRendererField,
  state: FormState,
  set: (key: string, value: FormState[string]) => void,
  errors: Record<string, string>,
  members: BusinessCatalogMember[],
  momentId: string,
  vendors: BusinessCatalogVendor[],
) {
  const val = state[field.key] ?? field.default_value ?? field.default ?? "";
  const err = errors[field.key];
  const strVal = String(val);
  const label = resolveFieldLabel(field, state);

  switch (field.field_type) {
    case "text":
      return (
        <TextField
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
          placeholder={field.placeholder}
        />
      );
    case "textarea":
      return (
        <TextArea
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
        />
      );
    case "amount":
      return (
        <MoneyInput
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
          currencyCode={String(state.currency ?? "INR")}
        />
      );
    case "date":
      return (
        <DateInput
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
        />
      );
    case "datetime":
      return (
        <DateTimeInput
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
        />
      );
    case "member_picker":
      return (
        <MemberPicker
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          members={members}
          required={field.required}
          error={err}
        />
      );
    case "member_multi_picker":
    case "member_multi_select":
      return (
        <MemberMultiPicker
          key={field.key}
          label={label}
          value={Array.isArray(state[field.key]) ? (state[field.key] as string[]) : []}
          onChange={(v) => set(field.key, v)}
          members={members}
          required={field.required}
          error={err}
        />
      );
    case "currency":
      return (
        <CurrencyPicker
          key={field.key}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          label={label}
        />
      );
    case "segmented":
    case "chips":
    case "chip_grid":
      return (
        <ChipSelector
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={field.options ?? []}
          required={field.required}
          error={err}
        />
      );
    case "searchable_select":
      return (
        <SearchableSelect
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={field.options ?? []}
          required={field.required}
          error={err}
        />
      );
    case "single_select": {
      const options = field.options ?? [];
      if (options.length > 0 && options.length <= 4) {
        return (
          <ChipSelector
            key={field.key}
            label={label}
            value={strVal}
            onChange={(v) => set(field.key, v)}
            options={options}
            required={field.required}
            error={err}
          />
        );
      }
      return (
        <SearchableSelect
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={options}
          required={field.required}
          error={err}
        />
      );
    }
    case "attachment":
      return (
        <AttachmentField
          key={field.key}
          label={label}
          value={Array.isArray(state[field.key]) ? (state[field.key] as string[]) : []}
          onChange={(v) => set(field.key, v)}
          momentId={momentId}
          required={field.required}
          error={err}
        />
      );
    case "category":
      return (
        <CategoryPicker
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={field.options ?? []}
          required={field.required}
          error={err}
        />
      );
    case "vendor":
    case "vendor_picker":
      return (
        <VendorPicker
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={vendors}
          allowCustom={field.allow_custom !== false}
          required={field.required}
          error={err}
        />
      );
    case "approval":
      return (
        <ApprovalPicker
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          members={members}
          required={field.required}
          error={err}
        />
      );
    case "priority":
      return (
        <PrioritySelector
          key={field.key}
          value={strVal}
          onChange={(v) => set(field.key, v)}
        />
      );
    case "status":
      return (
        <StatusSelector
          key={field.key}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          options={field.options}
        />
      );
    case "toggle":
      return (
        <Toggle
          key={field.key}
          label={label}
          value={state[field.key] === true || state[field.key] === "true"}
          onChange={(v) => set(field.key, v)}
        />
      );
    case "notes":
      return (
        <NotesField
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
        />
      );
    default:
      return (
        <TextField
          key={field.key}
          label={label}
          value={strVal}
          onChange={(v) => set(field.key, v)}
          required={field.required}
          error={err}
        />
      );
  }
}

function isFieldVisible(field: BusinessRendererField, state: FormState): boolean {
  if (!field.visible_when) return true;
  return String(state[field.visible_when.field] ?? "") === field.visible_when.equals;
}

export function SchemaDrivenRenderer({
  action,
  momentId,
  templateId,
  members,
  vendors = [],
  rendererMeta,
  onSubmit,
  onClose,
  onSuccess,
  contextLine,
  titleKey,
  amountKey,
  buildReviewRows: customReviewRows,
  transformPayload,
}: SchemaDrivenRendererProps) {
  const reviewEnabled = action.supports?.review !== false && rendererMeta.review_enabled !== false;

  const steps: ProgressiveStep[] = useMemo(() => {
    const meta = rendererMeta;
    if (meta.steps?.length) {
      return meta.steps.map((s) => {
        const stepFields = meta.fields.filter((f) => f.step_id === s.id || s.field_keys.includes(f.key));
        return {
          id: s.id,
          title: s.title,
          render: ({ state, set, errors }) => (
            <div className="space-y-4">
              {stepFields
                .filter((f) => isFieldVisible(f, state))
                .map((f) => renderField(f, state, set, errors, members, momentId, vendors))}
              <BalanceDueBanner state={state} vendors={vendors} />
            </div>
          ),
          validate: (state: FormState) => {
            const errs: Record<string, string> = {};
            for (const f of stepFields) {
              if (!f.required) continue;
              if (!isFieldVisible(f, state)) continue;
              const v = state[f.key];
              if (v == null || v === "" || (Array.isArray(v) && !v.length)) {
                errs[f.key] = `${f.label} is required`;
              }
            }
            if (amountKey && stepFields.some((f) => f.key === amountKey)) {
              const n = Number.parseFloat(String(state[amountKey] ?? ""));
              if (!Number.isFinite(n) || n <= 0) errs[amountKey] = "Enter a valid amount greater than 0";
            }
            return errs;
          },
        };
      });
    }

    return [
      {
        id: "form",
        title: meta.title || meta.label || action.label,
        render: ({ state, set, errors }) => (
          <div className="space-y-4">
            {meta.fields
              .filter((f) => isFieldVisible(f, state))
              .map((f) => renderField(f, state, set, errors, members, momentId, vendors))}
            <BalanceDueBanner state={state} vendors={vendors} />
          </div>
        ),
        validate: (state: FormState) => {
          const errs: Record<string, string> = {};
          for (const f of meta.fields) {
            if (!f.required) continue;
            if (!isFieldVisible(f, state)) continue;
            const v = state[f.key];
            if (v == null || v === "" || (Array.isArray(v) && !v.length)) {
              errs[f.key] = `${f.label} is required`;
            }
          }
          if (amountKey) {
            const n = Number.parseFloat(String(state[amountKey] ?? ""));
            if (!Number.isFinite(n) || n <= 0) errs[amountKey] = "Enter a valid amount greater than 0";
          }
          const paidField = meta.fields.find((f) => f.key === "amount_paid_minor");
          if (paidField && isFieldVisible(paidField, state)) {
            const paid = Number.parseFloat(String(state.amount_paid_minor ?? ""));
            const total = Number.parseFloat(String(state.amount_minor ?? ""));
            if (!Number.isFinite(paid) || paid < 0) {
              errs.amount_paid_minor = "Enter amount paid";
            } else if (Number.isFinite(total) && paid > total) {
              errs.amount_paid_minor = "Amount paid cannot exceed spend amount";
            }
          }
          return errs;
        },
      },
    ];
  }, [rendererMeta, action, members, vendors, amountKey, momentId]);

  const initialState: FormState = useMemo(() => {
    const init: FormState = {};
    for (const f of rendererMeta.fields) {
      if (f.field_type === "date" && f.required) {
        init[f.key] = todayISO();
      } else if (f.field_type === "toggle") {
        const d = f.default_value ?? f.default;
        init[f.key] = d === true || d === "true";
      } else if (f.default_value != null && f.default_value !== "") {
        init[f.key] = String(f.default_value);
      } else if (typeof f.default === "string" && f.default) {
        init[f.key] = f.default;
      }
    }
    if (rendererMeta.fields.some((f) => f.field_type === "amount")) {
      init.currency = "INR";
      init.currency_code = "INR";
    }
    return init;
  }, [rendererMeta]);

  function defaultBuildPayload(s: FormState): Record<string, unknown> {
    const raw: Record<string, unknown> = {};
    for (const f of rendererMeta.fields) {
      if (!isFieldVisible(f, s)) continue;
      const v = s[f.key];
      if (v !== undefined && v !== "") raw[f.key] = v;
    }
    raw.title = s[titleKey ?? "title"] ?? action.label;
    if (s.payment_method) raw.payment_method = s.payment_method;
    if (s.payment_status) raw.payment_status = s.payment_status;
    const normalized = schemaAmountToMinor(raw);
    const due = computeDueMinor(s);
    if (due > 0) normalized.amount_due_minor = due;
    else if (String(s.payment_status ?? "") === "paid_full") normalized.amount_due_minor = 0;
    return transformPayload ? transformPayload(normalized) : normalized;
  }

  function defaultReviewRows(s: FormState): Array<{ label: string; value: string }> {
    const rows = rendererMeta.fields
      .filter((f) => {
        if (!isFieldVisible(f, s)) return false;
        const v = s[f.key];
        return v !== undefined && v !== "" && !(Array.isArray(v) && !v.length);
      })
      .map((f) => {
        let value = Array.isArray(s[f.key]) ? (s[f.key] as string[]).join(", ") : String(s[f.key]);
        if (f.options?.length) value = chipLabel(f.options, String(s[f.key]));
        return { label: f.label, value };
      });
    const due = computeDueMinor(s);
    if (due > 0) {
      rows.push({
        label: balanceDueLabel(s, vendors),
        value: formatMinor(due, String(s.currency_code ?? s.currency ?? "INR")),
      });
    }
    return rows;
  }

  return (
    <ProgressiveActionForm
      action={action}
      momentId={momentId}
      templateId={templateId}
      steps={steps}
      buildPayload={defaultBuildPayload}
      buildReviewRows={customReviewRows ?? defaultReviewRows}
      onSubmit={onSubmit}
      onClose={onClose}
      onSuccess={onSuccess}
      draftTitleKey={titleKey ?? "title"}
      reviewEnabled={reviewEnabled}
      contextLine={contextLine}
      initialState={initialState}
    />
  );
}

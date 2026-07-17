import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";

export type TemplateActivityFilter = string;

export type TemplateActivityItem = {
  id: string;
  activity_type: string;
  title: string;
  subtitle: string;
  occurred_at: string;
  amount_minor: number;
  currency_code?: string;
  icon?: string | null;
  impact_label?: string | null;
  relative_time?: string | null;
  edit_event_type: string;
  can_edit: boolean;
  can_delete: boolean;
};

export type TemplateActivitySummary = {
  total_logs: number;
  this_month: number;
  total_amount_minor: number;
};

export type TemplateActivityListResponse = {
  items: TemplateActivityItem[];
  summary?: TemplateActivitySummary;
  filters?: TemplateActivityFilter[];
};

export type TemplateActivityEditField = {
  key: string;
  label: string;
  field_type: string;
  required?: boolean;
  path?: string;
  options?: Array<{ value: string; label: string }>;
};

export type TemplateActivityEditSchema = {
  event_type: string;
  fields: TemplateActivityEditField[];
  allowed_actions?: string[];
};

export type TemplateActivityDetail = {
  id?: string;
  quick_add_event_id?: string;
  moment_id?: string;
  event_type?: string;
  event_title?: string;
  event_summary?: string | null;
  edit_schema?: TemplateActivityEditSchema;
  values?: Record<string, unknown>;
  expense?: Record<string, unknown> | null;
  future_building?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type TemplateActivityAdapter = {
  momentTypeCode: PersonalMomentTypeCode;
  screenTitle: string;
  screenSubtitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  editTitle: string;
  editSubtitle: string;
  saveChanges: string;
  cancel: string;
  deleteLabel: string;
  deleteConfirm: string;
  filters: Array<{ id: TemplateActivityFilter; label: string }>;
  filterMatches: (filterId: TemplateActivityFilter, activityType: string) => boolean;
  formatAmount: (minor: number) => string;
  groupToday: string;
  groupYesterday: string;
  groupThisWeek: string;
  groupEarlier: string;
};

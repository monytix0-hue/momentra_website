import catalogJson from "@/lib/business/business_widget_explainers.json";

export type BusinessWidgetExplainerId = keyof typeof catalogJson.widgets | string;

export type BusinessWidgetExplainer = {
  id: string;
  title: string;
  what: string;
  why: string;
  how: string;
};

type HowField = string | { default: string; [momentType: string]: string | undefined };

type RawWidget = {
  title: string;
  what: string;
  why: string;
  how: HowField;
};

type CatalogFile = {
  catalog_version: number;
  widgets: Record<string, RawWidget>;
};

const catalog = catalogJson as CatalogFile;

function resolveHow(how: HowField, momentTypeCode?: string | null): string {
  if (typeof how === "string") return how;
  const code = (momentTypeCode ?? "").toUpperCase();
  if (code && how[code]) return how[code] as string;
  return how.default;
}

/** Resolve a Business widget explainer by spreadsheet ID (e.g. PULSE-001). */
export function getBusinessWidgetExplainer(
  id: string,
  momentTypeCode?: string | null,
): BusinessWidgetExplainer | null {
  const raw = catalog.widgets[id];
  if (!raw) return null;
  return {
    id,
    title: raw.title,
    what: raw.what,
    why: raw.why,
    how: resolveHow(raw.how, momentTypeCode),
  };
}

export const BUSINESS_WIDGET_EXPLAINER_IDS = Object.keys(catalog.widgets);

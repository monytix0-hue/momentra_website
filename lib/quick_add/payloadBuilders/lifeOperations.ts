/** Life Operations quick-add form state and API payload builders. */
import { composeOccurredAt, nowISOTime, todayISODate } from "@/lib/quick_add/dateTimeDefaults";

export type LifeOpsQuickAddFormState = {
  transactionType: string;
  amountMinor: number;
  currencyCode: string;
  accountId: string;
  categoryCode: string;
  subcategoryCode: string;
  occurredDate: string;
  occurredTime: string;
  pressureImpact: string;
  commitmentName: string;
  commitmentType: string;
  focusArea: string;
  commitmentStatus: string;
  feelingState: string;
  reflectionNote: string;
  reflectionTag: string;
  recoveryType: string;
  recoveryDuration: string;
  recoveryEnergyImpact: string;
  recoveryNotes: string;
  rhythmActions: Set<string>;
  runtimeMode: string;
};

export function defaultLifeOpsFormState(defaultCurrencyCode = "INR"): LifeOpsQuickAddFormState {
  return {
    transactionType: "EXPENSE",
    amountMinor: 0,
    currencyCode: defaultCurrencyCode,
    accountId: "",
    categoryCode: "",
    subcategoryCode: "",
    occurredDate: todayISODate(),
    occurredTime: nowISOTime(),
    pressureImpact: "",
    commitmentName: "",
    commitmentType: "TASK",
    focusArea: "",
    commitmentStatus: "IN_PROGRESS",
    feelingState: "OKAY",
    reflectionNote: "",
    reflectionTag: "",
    recoveryType: "",
    recoveryDuration: "",
    recoveryEnergyImpact: "MODERATE",
    recoveryNotes: "",
    rhythmActions: new Set(),
    runtimeMode: "FLOW_MODE",
  };
}

function basePayload(momentId: string, eventType: string, eventTitle: string) {
  return { moment_id: momentId, event_type: eventType, event_title: eventTitle };
}

export function buildExpensePayload(
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
) {
  const stamp = composeOccurredAt(state.occurredDate, state.occurredTime);
  return {
    ...basePayload(momentId, "EXPENSE", eventTitle),
    expense: {
      transaction_type: state.transactionType,
      amount_minor: state.amountMinor,
      currency_code: state.currencyCode,
      account_id: state.accountId,
      category_code: state.categoryCode || undefined,
      subcategory_code: state.subcategoryCode || null,
      pressure_impact: state.pressureImpact || undefined,
      transaction_date: stamp || undefined,
    },
    occurred_at: stamp || undefined,
  };
}

export function buildCommitmentPayload(
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
) {
  const title = state.commitmentName.trim() || eventTitle;
  return {
    ...basePayload(momentId, "COMMITMENT", title),
    commitment: {
      commitment_name: state.commitmentName.trim(),
      commitment_type: state.commitmentType,
      focus_area: state.focusArea || undefined,
      commitment_status: state.commitmentStatus,
      intensity: "MODERATE",
    },
  };
}

export function buildReflectionPayload(
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
) {
  return {
    ...basePayload(momentId, "REFLECTION", eventTitle),
    reflection: {
      feeling_state: state.feelingState,
      reflection_note: state.reflectionNote.trim(),
      reflection_tag: state.reflectionTag || undefined,
    },
  };
}

export function buildRecoveryPayload(
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
) {
  return {
    ...basePayload(momentId, "RECOVERY", eventTitle),
    recovery: {
      recovery_type: state.recoveryType,
      recovery_intensity: state.recoveryEnergyImpact,
      duration_minutes: Number(state.recoveryDuration) || undefined,
      notes: state.recoveryNotes.trim() || undefined,
    },
  };
}

export function buildRhythmPayload(
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
) {
  const actions = Array.from(state.rhythmActions).sort();
  return {
    ...basePayload(momentId, "RHYTHM", eventTitle),
    rhythm: {
      rhythm_actions: actions,
      rhythm_action: actions[0],
      new_runtime_mode: state.runtimeMode,
      new_runtime_priority: state.runtimeMode === "SURVIVAL_MODE" ? "HIGH" : "MEDIUM",
    },
  };
}

export function buildLifeOpsQuickAddPayload(
  eventType: string,
  momentId: string,
  eventTitle: string,
  state: LifeOpsQuickAddFormState,
): Record<string, unknown> {
  switch (eventType) {
    case "EXPENSE":
      return buildExpensePayload(momentId, eventTitle, state);
    case "COMMITMENT":
      return buildCommitmentPayload(momentId, eventTitle, state);
    case "REFLECTION":
      return buildReflectionPayload(momentId, eventTitle, state);
    case "RECOVERY":
      return buildRecoveryPayload(momentId, eventTitle, state);
    case "RHYTHM":
      return buildRhythmPayload(momentId, eventTitle, state);
    default:
      return basePayload(momentId, eventType, eventTitle);
  }
}

export function canSubmitLifeOpsTab(tab: string, state: LifeOpsQuickAddFormState): boolean {
  switch (tab) {
    case "EXPENSE":
      return state.amountMinor > 0 && Boolean(state.accountId) && Boolean(state.categoryCode);
    case "COMMITMENT":
      return Boolean(state.commitmentName.trim());
    case "REFLECTION":
      return Boolean(state.feelingState);
    case "RECOVERY":
      return Boolean(state.recoveryType);
    case "RHYTHM":
      return Boolean(state.runtimeMode);
    default:
      return false;
  }
}

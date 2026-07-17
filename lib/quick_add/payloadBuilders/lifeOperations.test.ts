import { describe, expect, it } from "vitest";
import {
  buildExpensePayload,
  canSubmitLifeOpsTab,
  defaultLifeOpsFormState,
} from "@/lib/quick_add/payloadBuilders/lifeOperations";

describe("buildExpensePayload", () => {
  it("sends amount_minor, currency_code, and category_code", () => {
    const state = {
      ...defaultLifeOpsFormState("INR"),
      amountMinor: 450000,
      currencyCode: "INR",
      accountId: "acc-1",
      categoryCode: "FOOD",
      transactionType: "EXPENSE",
      occurredDate: "2026-07-13",
      occurredTime: "14:05",
    };
    const payload = buildExpensePayload("moment-1", "Coffee", state);
    expect(payload.expense).toEqual({
      transaction_type: "EXPENSE",
      amount_minor: 450000,
      currency_code: "INR",
      account_id: "acc-1",
      category_code: "FOOD",
      subcategory_code: null,
      pressure_impact: undefined,
      transaction_date: "2026-07-13T14:05",
    });
    expect(payload.occurred_at).toBe("2026-07-13T14:05");
  });

  it("includes subcategory_code when selected", () => {
    const state = {
      ...defaultLifeOpsFormState("INR"),
      amountMinor: 100,
      accountId: "acc-1",
      categoryCode: "FOOD",
      subcategoryCode: "GROCERIES",
    };
    const payload = buildExpensePayload("moment-1", "Groceries", state);
    expect(payload.expense.subcategory_code).toBe("GROCERIES");
  });

  it("defaults occurred date and time on new form state", () => {
    const state = defaultLifeOpsFormState();
    expect(state.occurredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(state.occurredTime).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("canSubmitLifeOpsTab", () => {
  it("requires amount_minor, account, and category for EXPENSE", () => {
    const state = defaultLifeOpsFormState();
    expect(canSubmitLifeOpsTab("EXPENSE", state)).toBe(false);
    state.amountMinor = 100;
    state.accountId = "x";
    expect(canSubmitLifeOpsTab("EXPENSE", state)).toBe(false);
    state.categoryCode = "FOOD";
    expect(canSubmitLifeOpsTab("EXPENSE", state)).toBe(true);
  });
});

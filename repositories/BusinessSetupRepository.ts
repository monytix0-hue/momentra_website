import {
  activateBusinessSetup,
  createBusinessMoment,
  getBusinessSetupState,
  previewBusinessSetup,
  saveBusinessSetupDraft,
} from "@/lib/api/client";
import type {
  BusinessActivateResponse,
  BusinessMomentCreateResponse,
  BusinessSetupPreview,
  BusinessSetupState,
} from "@/lib/api/business";
import { invalidateBootstrapAfterMutation } from "@/stores/bootstrapStore";

const TEMPLATE_ID_BY_TYPE: Record<string, string> = {
  TEAM_OPERATIONS: "team_ops",
  BUSINESS_RUNWAY: "business_runway",
  BUSINESS_OPERATIONS: "business_operations",
};

export const BusinessSetupRepository = {
  templateIdForType(momentTypeCode: string): string {
    return TEMPLATE_ID_BY_TYPE[momentTypeCode] ?? momentTypeCode.toLowerCase();
  },

  async createDraft(input: {
    moment_type_code: string;
    title?: string;
    template_id?: string;
  }): Promise<BusinessMomentCreateResponse> {
    const templateId =
      input.template_id ?? BusinessSetupRepository.templateIdForType(input.moment_type_code);
    const created = await createBusinessMoment({
      moment_type_code: input.moment_type_code,
      title: input.title,
      template_id: templateId,
      template_version: "1",
    });
    // Fire-and-forget — does not return a Promise / does not block create.
    invalidateBootstrapAfterMutation();
    return created;
  },

  getSetupState(momentId: string): Promise<BusinessSetupState> {
    return getBusinessSetupState(momentId);
  },

  saveDraft(
    momentId: string,
    answers: Record<string, unknown>,
    progress?: { current_step: number; completed_steps: number[] },
  ): Promise<BusinessSetupState> {
    return saveBusinessSetupDraft(momentId, {
      answers,
      progress,
      setup_version: "1",
    });
  },

  preview(momentId: string, answers?: Record<string, unknown>): Promise<BusinessSetupPreview> {
    return previewBusinessSetup(momentId, { answers });
  },

  async activate(momentId: string): Promise<BusinessActivateResponse> {
    const result = await activateBusinessSetup(momentId);
    invalidateBootstrapAfterMutation();
    return result;
  },
};

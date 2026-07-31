/**
 * Catalog activation success copy for toast after setup dismiss.
 */
import { personalTemplateForMomentType, personalSetupTemplate } from "@/lib/personal/setupCatalog";
import { groupTemplateForMomentType, groupSetupTemplate } from "@/lib/group/setupCatalog";
import { setupTemplate, type SetupTemplateId } from "@/lib/business/setupCatalog";

export function personalActivationSuccessMessage(momentTypeCode: string | null | undefined): string {
  const id = personalTemplateForMomentType(momentTypeCode);
  return personalSetupTemplate(id).activation_success ?? "Moment activated";
}

export function groupActivationSuccessMessage(momentTypeCode: string | null | undefined): string {
  const id = groupTemplateForMomentType(momentTypeCode);
  return groupSetupTemplate(id).activation_success ?? "Group moment activated";
}

function businessTemplateForMomentType(momentTypeCode: string | null | undefined): SetupTemplateId {
  const code = (momentTypeCode ?? "").toUpperCase();
  if (code === "BUSINESS_RUNWAY") return "business_runway";
  if (code === "BUSINESS_OPERATIONS") return "business_operations";
  return "team_ops";
}

export function businessActivationSuccessMessage(momentTypeCode: string | null | undefined): string {
  const id = businessTemplateForMomentType(momentTypeCode);
  return setupTemplate(id).activation_success ?? "Business moment activated";
}

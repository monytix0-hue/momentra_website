import {
  archiveBusinessMoment,
  completeBusinessMoment,
  getBusinessCreateOptions,
  getBusinessSessionBootstrap,
  patchBusinessMoment,
} from "@/lib/api/client";

export const BusinessRepository = {
  getSessionBootstrap: getBusinessSessionBootstrap,
  getCreateOptions: getBusinessCreateOptions,
  patchMoment: patchBusinessMoment,
  completeMoment: completeBusinessMoment,
  archiveMoment: archiveBusinessMoment,
};

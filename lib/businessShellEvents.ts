export const BUSINESS_CREATE_OPEN_EVENT = "momentra:open-business-create";

export function openBusinessCreateOverlay(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUSINESS_CREATE_OPEN_EVENT));
  }
}
